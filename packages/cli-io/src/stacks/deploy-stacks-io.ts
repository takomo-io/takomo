import {
  DetailedChangeSet,
  DetailedCloudFormationStack,
  DetailedStackParameter,
  StackEvent,
  TemplateBody,
  TemplateSummary,
} from "@takomo/aws-model"
import {
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  DeployStacksIO,
  StackDeployOperationType,
  StacksDeployPlan,
  StacksOperationOutput,
} from "@takomo/stacks-commands"
import {
  CommandPath,
  InternalStack,
  StackGroup,
  StackPath,
} from "@takomo/stacks-model"
import {
  collectFromHierarchy,
  green,
  grey,
  LogWriter,
  orange,
  red,
  TkmLogger,
  yellow,
} from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { diffLines } from "diff"
import { createBaseIO } from "../cli-io"
import {
  formatResourceChange,
  formatStackEvent,
  formatStackStatus,
} from "../formatters"
import { printStacksOperationOutput } from "./common"

interface ConfirmStackDeployAnswerChoice {
  readonly name: string
  readonly value: ConfirmStackDeployAnswer
}

interface ConfirmDeployAnswerChoice {
  readonly name: string
  readonly value: ConfirmDeployAnswer
}

const CONFIRM_STACK_DEPLOY_ANSWER_CANCEL: ConfirmStackDeployAnswerChoice = {
  name: "cancel deploy of this stack and all remaining stacks",
  value: "CANCEL",
}

const CONFIRM_STACK_DEPLOY_ANSWER_REVIEW_TEMPLATE: ConfirmStackDeployAnswerChoice = {
  name: "review changes in the stack template",
  value: "REVIEW_TEMPLATE",
}

const CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE: ConfirmStackDeployAnswerChoice = {
  name: "continue to deploy the stack, then let me review the remaining stacks",
  value: "CONTINUE",
}

const CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE_AND_SKIP_REMAINING_REVIEWS: ConfirmStackDeployAnswerChoice = {
  name:
    "continue to deploy the stack, then deploy the remaining stacks without reviewing changes",
  value: "CONTINUE_AND_SKIP_REMAINING_REVIEWS",
}

const CONFIRM_DEPLOY_ANSWER_CANCEL: ConfirmDeployAnswerChoice = {
  name: "cancel deployment",
  value: "CANCEL",
}

const CONFIRM_DEPLOY_ANSWER_CONTINUE_AND_REVIEW: ConfirmDeployAnswerChoice = {
  name: "continue, but let me review changes to each stack",
  value: "CONTINUE_AND_REVIEW",
}

const CONFIRM_DEPLOY_ANSWER_CONTINUE_NO_REVIEW: ConfirmDeployAnswerChoice = {
  name: "continue, deploy all stacks without reviewing changes",
  value: "CONTINUE_NO_REVIEW",
}

export enum ParameterOperation {
  UPDATE = "update",
  ADD = "add",
  DELETE = "delete",
}

const formatStackOperation = (
  stackPath: StackPath,
  type: StackDeployOperationType,
): string => {
  switch (type) {
    case "CREATE":
      return green(`+ ${stackPath}:`)
    case "RECREATE":
      return orange(`± ${stackPath}:`)
    case "UPDATE":
      return yellow(`~ ${stackPath}:`)
    default:
      throw new Error(`Unsupported stack operation type: ${type}`)
  }
}

const formatParameterOperation = (param: ParameterSpec): string => {
  switch (param.operation) {
    case ParameterOperation.ADD:
      return green(`+ ${param.key}:`)
    case ParameterOperation.DELETE:
      return red(`- ${param.key}:`)
    case ParameterOperation.UPDATE:
      if (param.newNoEcho || param.currentNoEcho) {
        return yellow(
          `~ ${param.key}:    (possible update, but no way to be sure because no echo = true)`,
        )
      } else {
        return yellow(`~ ${param.key}:`)
      }

    default:
      throw new Error(`Unsupported parameter operation: ${param.operation}`)
  }
}

const formatParameterValue = (value?: string): string => {
  if (value !== undefined) {
    return value
  } else {
    return grey("<undefined>")
  }
}

export interface ParameterSpec {
  readonly key: string
  readonly operation: ParameterOperation
  readonly currentValue?: string
  readonly newValue?: string
  readonly newNoEcho: boolean
  readonly currentNoEcho: boolean
}

export interface ParametersSpec {
  readonly updated: ReadonlyArray<ParameterSpec>
  readonly added: ReadonlyArray<ParameterSpec>
  readonly removed: ReadonlyArray<ParameterSpec>
}

enum ResourceOperation {
  UPDATE = "update",
  ADD = "add",
  DELETE = "delete",
  REPLACE = "replace",
}

const resolveResourceOperation = (
  action: CloudFormation.ChangeAction,
  replacement: CloudFormation.Replacement,
): ResourceOperation => {
  switch (action) {
    case "Add":
      return ResourceOperation.ADD
    case "Modify":
      if (replacement === "True") {
        return ResourceOperation.REPLACE
      } else if (replacement === "Conditional") {
        return ResourceOperation.REPLACE
      } else {
        return ResourceOperation.UPDATE
      }
    case "Remove":
      return ResourceOperation.DELETE
    default:
      throw new Error(`Unsupported change action: ${action}`)
  }
}

export const collectRemovedParameters = (
  newParameters: ReadonlyArray<DetailedStackParameter>,
  existingParameters: ReadonlyArray<DetailedStackParameter>,
): ReadonlyArray<ParameterSpec> => {
  const newParameterNames = newParameters.map((p) => p.key)
  return existingParameters
    .filter((p) => !newParameterNames.includes(p.key))
    .map(({ key, value, noEcho }) => ({
      key,
      currentValue: value,
      newValue: undefined,
      operation: ParameterOperation.DELETE,
      currentNoEcho: noEcho,
      newNoEcho: false,
    }))
}

export const collectAddedParameters = (
  newParameters: ReadonlyArray<DetailedStackParameter>,
  existingParameters: ReadonlyArray<DetailedStackParameter>,
): ReadonlyArray<ParameterSpec> => {
  const existingParameterNames = existingParameters.map((p) => p.key)
  return newParameters
    .filter((p) => !existingParameterNames.includes(p.key))
    .map(({ key, value, noEcho }) => ({
      key,
      currentValue: undefined,
      newValue: value,
      operation: ParameterOperation.ADD,
      newNoEcho: noEcho,
      currentNoEcho: false,
    }))
}

export const collectUpdatedParameters = (
  newParameters: ReadonlyArray<DetailedStackParameter>,
  existingParameters: ReadonlyArray<DetailedStackParameter>,
): ReadonlyArray<ParameterSpec> => {
  const existingParameterNames = existingParameters.map((p) => p.key)
  return newParameters
    .filter((p) => existingParameterNames.includes(p.key))
    .map((newParam) => {
      const existingParam = existingParameters.find(
        (existingParam) => existingParam.key === newParam.key,
      )

      return [newParam, existingParam!]
    })
    .filter(
      ([newParam, existingParam]) =>
        newParam.noEcho ||
        existingParam.noEcho ||
        newParam.value !== existingParam.value,
    )
    .map(([newParam, existingParam]) => ({
      key: newParam.key,
      currentValue: existingParam?.value,
      newValue: newParam.value,
      operation: ParameterOperation.UPDATE,
      newNoEcho: newParam.noEcho,
      currentNoEcho: existingParam?.noEcho || false,
    }))
}

const buildParametersSpec = (
  templateSummary: TemplateSummary,
  changeSet: DetailedChangeSet,
  existingStack?: DetailedCloudFormationStack,
): ParametersSpec => {
  const newParameters = changeSet.parameters
  const existingParameters = existingStack?.parameters || []

  const updated = collectUpdatedParameters(newParameters, existingParameters)
  const added = collectAddedParameters(newParameters, existingParameters)
  const removed = collectRemovedParameters(newParameters, existingParameters)

  return {
    updated,
    added,
    removed,
  }
}

export const createDeployStacksIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): DeployStacksIO => {
  const io = createBaseIO(writer)

  // TODO: Come up some other solution
  let autoConfirmEnabled = false

  const chooseCommandPath = async (
    rootStackGroup: StackGroup,
  ): Promise<CommandPath> => {
    const allStackGroups = collectFromHierarchy(
      rootStackGroup,
      (s) => s.children,
    )

    const allCommandPaths = allStackGroups.reduce(
      (collected, stackGroup) => [
        ...collected,
        stackGroup.path,
        ...stackGroup.stacks.map((s) => s.path),
      ],
      new Array<string>(),
    )

    const source = async (
      answersSoFar: any,
      input: string,
    ): Promise<string[]> => {
      return input
        ? allCommandPaths.filter((p) => p.includes(input))
        : allCommandPaths
    }

    return io.autocomplete("Choose command path", source)
  }

  const confirmDeploy = async ({
    operations,
  }: StacksDeployPlan): Promise<ConfirmDeployAnswer> => {
    if (autoConfirmEnabled) {
      return "CONTINUE_NO_REVIEW"
    }

    io.subheader({ text: "Review stacks deployment plan:", marginTop: true })
    io.longMessage(
      [
        "A stacks deployment plan has been created and is shown below.",
        "Stacks will be deployed in the order they are listed, and in parallel",
        "when possible.",
        "",
        "Stack operations are indicated with the following symbols:",
        "",
        `  ${green("+ create")}           Stack will be created`,
        `  ${yellow("~ update")}           Stack will be updated`,
        `  ${orange(
          "± replace",
        )}          Stack has an invalid status and will be first deleted and then created`,
        "",
        `Following ${operations.length} stack(s) will be deployed:`,
      ],
      false,
      false,
      0,
    )

    const stacksMap = new Map(
      operations.map((o) => o.stack).map((s) => [s.path, s]),
    )

    for (const { stack, type, currentStack } of operations) {
      const stackIdentity = await stack.credentialManager.getCallerIdentity()

      io.longMessage(
        [
          `  ${formatStackOperation(stack.path, type)}`,
          `      name:          ${stack.name}`,
          `      status:        ${formatStackStatus(currentStack?.status)}`,
          `      account id:    ${stackIdentity.accountId}`,
          `      region:        ${stack.region}`,
          "      credentials:",
          `        user id:     ${stackIdentity.userId}`,
          `        account id:  ${stackIdentity.accountId}`,
          `        arn:         ${stackIdentity.arn}`,
        ],
        true,
        false,
        0,
      )

      if (stack.dependencies.length > 0) {
        io.message({ text: "      dependencies:" })
        printStackDependencies(stack, stacksMap, 8)
      } else {
        io.message({ text: "      dependencies:  []" })
      }
    }

    return io.choose(
      "How do you want to continue?",
      [
        CONFIRM_DEPLOY_ANSWER_CANCEL,
        CONFIRM_DEPLOY_ANSWER_CONTINUE_AND_REVIEW,
        CONFIRM_DEPLOY_ANSWER_CONTINUE_NO_REVIEW,
      ],
      true,
    )
  }

  const printOutput = (output: StacksOperationOutput): StacksOperationOutput =>
    printStacksOperationOutput(io, output, logger.logLevel)

  const printChangeSet = (
    path: StackPath,
    changeSet?: DetailedChangeSet,
  ): void => {
    if (!changeSet) {
      io.message({ text: `0 stack resources to modify:`, marginTop: true })
      return
    }

    const changes = changeSet.changes

    const summary = new Map<ResourceOperation, number>([
      [ResourceOperation.ADD, 0],
      [ResourceOperation.UPDATE, 0],
      [ResourceOperation.DELETE, 0],
      [ResourceOperation.REPLACE, 0],
    ])

    io.message({
      text: `${changes.length} stack resources to modify:`,
      marginTop: true,
    })

    changes.forEach((change) => {
      const {
        logicalResourceId,
        action,
        replacement,
        scope,
        physicalResourceId,
        resourceType,
        details,
      } = change.resourceChange

      const operation = resolveResourceOperation(action, replacement)

      summary.set(operation, summary.get(operation)! + 1)

      io.message({
        text: formatResourceChange(action, replacement, logicalResourceId),
        marginTop: true,
      })
      io.message({ text: `      type:                      ${resourceType}` })
      io.message({
        text: `      physical id:               ${
          physicalResourceId || "<known after deploy>"
        }`,
      })

      if (replacement) {
        io.message({ text: `      replacement:               ${replacement}` })
      }

      if (scope.length > 0) {
        io.message({ text: `      scope:                     ${scope}` })
      }

      if (details.length > 0) {
        io.message({ text: `      details:` })
        details.forEach((detail) => {
          io.message({
            text: `        - causing entity:        ${detail.causingEntity}`,
          })
          io.message({
            text: `          evaluation:            ${detail.evaluation}`,
          })
          io.message({
            text: `          change source:         ${detail.changeSource}`,
          })

          if (detail.target) {
            io.message({ text: `          target:` })
            io.message({
              text: `            attribute:           ${detail.target.attribute}`,
            })
            io.message({
              text: `            name:                ${detail.target.name}`,
            })
            io.message({
              text: `            require recreation:  ${detail.target.requiresRecreation}`,
            })
          } else {
            io.message({ text: `          target:                undefined` })
          }
        })
      }
    })

    const addCount = summary.get(ResourceOperation.ADD)!.toString()
    const modifyCount = summary.get(ResourceOperation.UPDATE)!.toString()
    const removeCount = summary.get(ResourceOperation.DELETE)!.toString()
    const replaceCount = summary.get(ResourceOperation.REPLACE)!.toString()

    io.message({
      text: `add: ${green(addCount)}, update: ${yellow(
        modifyCount,
      )}, replace: ${orange(replaceCount)}, delete: ${red(removeCount)}`,
      marginTop: true,
      marginBottom: true,
    })
  }

  const printParameters = (
    templateSummary: TemplateSummary,
    changeSet?: DetailedChangeSet,
    existingStack?: DetailedCloudFormationStack,
  ): void => {
    if (!changeSet) {
      return
    }

    const { updated, added, removed } = buildParametersSpec(
      templateSummary,
      changeSet,
      existingStack,
    )

    const all = [...updated, ...added, ...removed].sort((a, b) =>
      a.key.localeCompare(b.key),
    )
    if (all.length === 0) {
      return
    }

    io.message({ text: `${all.length} stack parameters to modify:` })

    all.forEach((param) => {
      io.message({
        text: `  ${formatParameterOperation(param)}`,
        marginTop: true,
      })
      io.message({ text: `      no echo:   ${param.newNoEcho}` })
      io.message({
        text: `      current:   ${formatParameterValue(param.currentValue)}`,
      })
      io.message({
        text: `      new:       ${formatParameterValue(param.newValue)}`,
      })
    })
  }

  const printTerminationProtection = (
    stack: InternalStack,
    existingStack?: DetailedCloudFormationStack,
  ): void => {
    const protection = stack.terminationProtection
      ? green("enabled")
      : red("disabled")
    if (!existingStack) {
      io.message({
        text: `Termination protection will be set to ${protection}`,
        marginTop: true,
      })
      return
    }

    if (
      existingStack.enableTerminationProtection !== stack.terminationProtection
    ) {
      io.message({
        text: `Termination protection will be changed to ${protection}`,
        marginTop: true,
      })
    }
  }

  const confirmStackDeploy = async (
    stack: InternalStack,
    templateBody: TemplateBody,
    templateSummary: TemplateSummary,
    existingStack?: DetailedCloudFormationStack,
    changeSet?: DetailedChangeSet,
  ): Promise<ConfirmStackDeployAnswer> => {
    if (autoConfirmEnabled) {
      return "CONTINUE"
    }

    io.subheader({
      text: "Review deployment plan for a stack:",
      marginTop: true,
    })
    io.longMessage(
      [
        "A stack deployment plan has been created and is shown below.",
        "",
        `  stack path:    ${stack.path}`,
        `  stack name:    ${stack.name}`,
        `  stack region:  ${stack.region}`,
        "",
        "Operations targeting stack parameters or resources are indicated with the following symbols:",
        "",
        `  ${green("+ create")}       Resource/parameter will be created`,
        `  ${yellow(
          "~ update",
        )}       Resource/parameter will be updated in-place`,
        `  ${orange(
          "± replace",
        )}      Resource can't be updated in-place and will be replaced with a new resource`,
        `  ${red("- delete")}       Resource/parameter will be deleted`,
        "",
      ],
      false,
      false,
      0,
    )

    printParameters(templateSummary, changeSet, existingStack)

    printTerminationProtection(stack, existingStack)

    printChangeSet(stack.path, changeSet)

    const answer = await io.choose(
      "How do you want to continue the deployment?",
      [
        CONFIRM_STACK_DEPLOY_ANSWER_CANCEL,
        CONFIRM_STACK_DEPLOY_ANSWER_REVIEW_TEMPLATE,
        CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE,
        CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE_AND_SKIP_REMAINING_REVIEWS,
      ],
      true,
    )

    if (answer === "REVIEW_TEMPLATE") {
      const currentTemplateBody = await stack
        .getCloudFormationClient()
        .getCurrentTemplate(stack.name)
      const lines = diffLines(currentTemplateBody, templateBody)
      const diffOutput = lines
        .map((line) => {
          if (line.added) return green(line.value)
          else if (line.removed) return red(line.value)
          else return line.value
        })
        .join("")

      io.message({ text: diffOutput, marginTop: true })

      const reviewAnswer = await io.choose(
        "How do you want to continue the deployment?",
        [
          CONFIRM_STACK_DEPLOY_ANSWER_CANCEL,
          CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE,
          CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE_AND_SKIP_REMAINING_REVIEWS,
        ],
        true,
      )

      if (reviewAnswer === "CONTINUE_AND_SKIP_REMAINING_REVIEWS") {
        autoConfirmEnabled = true
      }

      return reviewAnswer
    }

    if (answer === "CONTINUE_AND_SKIP_REMAINING_REVIEWS") {
      autoConfirmEnabled = true
    }

    return answer
  }

  const printStackEvent = (stackPath: StackPath, e: StackEvent): void =>
    logger.info(stackPath + " - " + formatStackEvent(e))

  const printStackDependencies = (
    stack: InternalStack,
    stacksMap: Map<StackPath, InternalStack>,
    depth: number,
  ) => {
    stack.dependencies.forEach((dependencyPath) => {
      const dependency = stacksMap.get(dependencyPath)
      if (!dependency) {
        throw new Error(`Dependency ${dependencyPath} was not found`)
      }

      const padding = " ".repeat(depth)
      const end = dependency.dependencies.length > 0 ? ":" : ""

      io.message({ text: `${padding}- ${dependencyPath}${end}` })

      printStackDependencies(dependency, stacksMap, depth + 2)
    })
  }

  return {
    ...logger,
    ...io,
    chooseCommandPath,
    confirmDeploy,
    confirmStackDeploy,
    printOutput,
    printStackEvent,
  }
}
