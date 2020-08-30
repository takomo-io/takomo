import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandPath, Options, StackPath } from "@takomo/core"
import {
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  DeployStacksIO,
  StacksOperationOutput,
} from "@takomo/stacks-commands"
import { resolveStackLaunchType } from "@takomo/stacks-context"
import {
  CommandContext,
  Stack,
  StackGroup,
  StackLaunchType,
} from "@takomo/stacks-model"
import {
  collectFromHierarchy,
  green,
  grey,
  orange,
  red,
  yellow,
} from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { DescribeChangeSetOutput } from "aws-sdk/clients/cloudformation"
import { diffLines } from "diff"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import CliIO from "../cli-io"
import {
  formatCommandStatus,
  formatResourceChange,
  formatStackEvent,
  formatStackStatus,
} from "../formatters"

const CONFIRM_STACK_DEPLOY_ANSWER_CANCEL = {
  name: "cancel deploy of this stack and all remaining stacks",
  value: ConfirmStackDeployAnswer.CANCEL,
}

const CONFIRM_STACK_DEPLOY_ANSWER_REVIEW_TEMPLATE = {
  name: "review changes in the stack template",
  value: ConfirmStackDeployAnswer.REVIEW_TEMPLATE,
}

const CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE = {
  name: "continue to deploy the stack, then let me review the remaining stacks",
  value: ConfirmStackDeployAnswer.CONTINUE,
}

const CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE_AND_SKIP_REMAINING_REVIEWS = {
  name:
    "continue to deploy the stack, then deploy the remaining stacks without reviewing changes",
  value: ConfirmStackDeployAnswer.CONTINUE_AND_SKIP_REMAINING_REVIEWS,
}

const CONFIRM_DEPLOY_ANSWER_CANCEL = {
  name: "cancel deployment",
  value: ConfirmDeployAnswer.CANCEL,
}

const CONFIRM_DEPLOY_ANSWER_CONTINUE_AND_REVIEW = {
  name: "continue, but let me review changes to each stack",
  value: ConfirmDeployAnswer.CONTINUE_AND_REVIEW,
}

const CONFIRM_DEPLOY_ANSWER_CONTINUE_NO_REVIEW = {
  name: "continue, deploy all stacks without reviewing changes",
  value: ConfirmDeployAnswer.CONTINUE_NO_REVIEW,
}

export enum ParameterOperation {
  UPDATE = "update",
  ADD = "add",
  DELETE = "delete",
}

const formatStackOperation = (
  stackPath: StackPath,
  launchType: StackLaunchType,
): string => {
  switch (launchType) {
    case StackLaunchType.CREATE:
      return green(`+ ${stackPath}:`)
    case StackLaunchType.RECREATE:
      return orange(`± ${stackPath}:`)
    case StackLaunchType.UPDATE:
      return yellow(`~ ${stackPath}:`)
    default:
      throw new Error(`Unsupported stack launch type: ${launchType}`)
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

const formatParameterValue = (value: string | null): string => {
  if (value !== null) {
    return value
  } else {
    return grey("<undefined>")
  }
}

export interface ParameterSpec {
  readonly key: string
  readonly operation: ParameterOperation
  readonly currentValue: string | null
  readonly newValue: string | null
  readonly newNoEcho: boolean
  readonly currentNoEcho: boolean
}

export interface ParametersSpec {
  readonly updated: ParameterSpec[]
  readonly added: ParameterSpec[]
  readonly removed: ParameterSpec[]
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
  newParameterDeclarations: CloudFormation.ParameterDeclaration[],
  newParameters: CloudFormation.Parameter[],
  existingParameterDeclarations: CloudFormation.ParameterDeclaration[],
  existingParameters: CloudFormation.Parameter[],
): ParameterSpec[] => {
  const newParameterNames = newParameters.map((p) => p.ParameterKey!)

  return existingParameters
    .filter((p) => !newParameterNames.includes(p.ParameterKey!))
    .map(({ ParameterKey, ParameterValue }) => ({
      key: ParameterKey!,
      currentValue: ParameterValue || null,
      newValue: null,
      operation: ParameterOperation.DELETE,
      currentNoEcho:
        existingParameterDeclarations.find(
          (d) => d.ParameterKey === ParameterKey,
        )?.NoEcho || false,
      newNoEcho: false,
    }))
}

export const collectAddedParameters = (
  newParameterDeclarations: CloudFormation.ParameterDeclaration[],
  newParameters: CloudFormation.Parameter[],
  existingParameterDeclarations: CloudFormation.ParameterDeclaration[],
  existingParameters: CloudFormation.Parameter[],
): ParameterSpec[] => {
  const existingParameterNames = existingParameters.map((p) => p.ParameterKey!)
  return newParameters
    .filter((p) => !existingParameterNames.includes(p.ParameterKey!))
    .map(({ ParameterKey, ParameterValue }) => ({
      key: ParameterKey!,
      currentValue: null,
      newValue: ParameterValue || null,
      operation: ParameterOperation.ADD,
      newNoEcho:
        newParameterDeclarations.find((d) => d.ParameterKey === ParameterKey)
          ?.NoEcho || false,
      currentNoEcho: false,
    }))
}

export const collectUpdatedParameters = (
  newParameterDeclarations: CloudFormation.ParameterDeclaration[],
  newParameters: CloudFormation.Parameter[],
  existingParameterDeclarations: CloudFormation.ParameterDeclaration[],
  existingParameters: CloudFormation.Parameter[],
): ParameterSpec[] => {
  return newParameters
    .map((p) => {
      const existing = existingParameters.find(
        (e) => e.ParameterKey === p.ParameterKey,
      )
      return [p, existing]
    })
    .filter(([p, e]) => {
      if (!e) {
        return false
      }

      const newNoEcho =
        newParameterDeclarations.find(
          (d) => d.ParameterKey === p?.ParameterKey!,
        )?.NoEcho || false
      const existingNoEcho =
        existingParameterDeclarations.find(
          (d) => d.ParameterKey === p?.ParameterKey!,
        )?.NoEcho || false

      if (newNoEcho || existingNoEcho) {
        return true
      }

      return e.ParameterValue !== p?.ParameterValue
    })
    .map(([p, e]) => ({
      key: p?.ParameterKey!,
      currentValue: e?.ParameterValue || null,
      newValue: p?.ParameterValue || null,
      operation: ParameterOperation.UPDATE,
      newNoEcho:
        newParameterDeclarations.find((d) => d.ParameterKey === p?.ParameterKey)
          ?.NoEcho || false,
      currentNoEcho:
        existingParameterDeclarations.find(
          (d) => d.ParameterKey === p?.ParameterKey,
        )?.NoEcho || false,
    }))
}

const buildParametersSpec = (
  changeSet: DescribeChangeSetOutput,
  templateSummary: CloudFormation.GetTemplateSummaryOutput,
  existingStack: CloudFormation.Stack | null,
  existingTemplateSummary: CloudFormation.GetTemplateSummaryOutput | null,
): ParametersSpec => {
  const newParameters = changeSet.Parameters || []
  const newParameterDeclarations = templateSummary.Parameters || []
  const existingParameters = existingStack?.Parameters || []
  const existingParameterDeclarations =
    existingTemplateSummary?.Parameters || []

  const updated = collectUpdatedParameters(
    newParameterDeclarations,
    newParameters,
    existingParameterDeclarations,
    existingParameters,
  )
  const added = collectAddedParameters(
    newParameterDeclarations,
    newParameters,
    existingParameterDeclarations,
    existingParameters,
  )
  const removed = collectRemovedParameters(
    newParameterDeclarations,
    newParameters,
    existingParameterDeclarations,
    existingParameters,
  )

  return {
    updated,
    added,
    removed,
  }
}

export class CliDeployStacksIO extends CliIO implements DeployStacksIO {
  private autoConfirm: boolean

  constructor(options: Options, loggerName: string | null = null) {
    super(options, loggerName)
    this.autoConfirm = options.isAutoConfirmEnabled()
  }

  chooseCommandPath = async (
    rootStackGroup: StackGroup,
  ): Promise<CommandPath> => {
    const allStackGroups = collectFromHierarchy(rootStackGroup, (s) =>
      s.getChildren(),
    )

    const allCommandPaths = allStackGroups.reduce(
      (collected, stackGroup) => [
        ...collected,
        stackGroup.getPath(),
        ...stackGroup.getStacks().map((s) => s.getPath()),
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

    return this.autocomplete("Choose command path", source)
  }

  confirmDeploy = async (ctx: CommandContext): Promise<ConfirmDeployAnswer> => {
    if (this.autoConfirm) {
      return ConfirmDeployAnswer.CONTINUE_NO_REVIEW
    }

    const identity = await ctx.getCredentialProvider().getCallerIdentity()
    this.debugObject("Default credentials:", identity)

    const stacks = ctx.getStacksToProcess()

    this.subheader("Review stacks deployment plan:", true)
    this.longMessage([
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
      )}          Stack is in invalid state and will be first deleted and then created`,
      "",
      `Following ${stacks.length} stack(s) will be deployed:`,
    ])

    for (const stack of stacks) {
      const stackIdentity = await stack
        .getCredentialProvider()
        .getCallerIdentity()

      const current = await ctx.getExistingStack(stack.getPath())
      const status = current ? current.StackStatus : null
      const launchType = resolveStackLaunchType(current?.StackStatus || null)
      const stackOperation = formatStackOperation(stack.getPath(), launchType)

      this.longMessage(
        [
          `  ${stackOperation}`,
          `      name:          ${stack.getName()}`,
          `      status:        ${formatStackStatus(status)}`,
          `      account id:    ${stackIdentity.accountId}`,
          `      region:        ${stack.getRegion()}`,
          "      credentials:",
          `        user id:     ${stackIdentity.userId}`,
          `        account id:  ${stackIdentity.accountId}`,
          `        arn:         ${stackIdentity.arn}`,
        ],
        true,
      )

      if (stack.getDependencies().length > 0) {
        this.message("      dependencies:")
        this.printStackDependencies(stack, ctx, 8)
      } else {
        this.message("      dependencies:  []")
      }
    }

    return this.choose(
      "How do you want to continue?",
      [
        CONFIRM_DEPLOY_ANSWER_CANCEL,
        CONFIRM_DEPLOY_ANSWER_CONTINUE_AND_REVIEW,
        CONFIRM_DEPLOY_ANSWER_CONTINUE_NO_REVIEW,
      ],
      true,
    )
  }

  printOutput = (output: StacksOperationOutput): StacksOperationOutput => {
    const succeeded = output.results.filter((r) => r.success)
    const failed = output.results.filter((r) => !r.success)
    const all = [...succeeded, ...failed]

    const table = new Table()

    all.forEach((r) => {
      table.cell("Stack path", r.stack.getPath())
      table.cell("Stack name", r.stack.getName())
      table.cell("Status", formatCommandStatus(r.status))
      table.cell("Reason", r.reason)
      table.cell("Time", prettyMs(r.watch.secondsElapsed))
      table.cell("Message", r.message)
      table.newRow()
    })

    this.message(table.toString(), true)

    if (failed.length > 0) {
      this.message("Events for failed stacks", true)
      this.message("------------------------")

      failed.forEach((r) => {
        this.message(r.stack.getPath(), true, true)

        if (r.events.length === 0) {
          this.message("  <no events>")
        } else {
          const fn = (e: CloudFormation.StackEvent) =>
            this.message("  " + formatStackEvent(e))
          r.events.forEach(fn)
        }
      })
    }

    return output
  }

  printChangeSet = (
    path: StackPath,
    changeSet: DescribeChangeSetOutput | null,
  ): void => {
    if (!changeSet) {
      this.message(`0 stack resources to modify:`, true)
      return
    }

    const changes = changeSet.Changes || []

    const summary = new Map<ResourceOperation, number>([
      [ResourceOperation.ADD, 0],
      [ResourceOperation.UPDATE, 0],
      [ResourceOperation.DELETE, 0],
      [ResourceOperation.REPLACE, 0],
    ])

    this.message(`${changes.length} stack resources to modify:`, true)

    changes.forEach((change) => {
      const {
        LogicalResourceId,
        Action,
        Replacement,
        Scope,
        PhysicalResourceId,
        ResourceType,
        Details,
      } = change.ResourceChange!

      const operation = resolveResourceOperation(Action!, Replacement!)

      summary.set(operation, summary.get(operation)! + 1)

      this.message(
        formatResourceChange(Action!, Replacement!, LogicalResourceId!),
        true,
      )
      this.message(`      type:                      ${ResourceType}`)
      this.message(
        `      physical id:               ${
          PhysicalResourceId || "<known after deploy>"
        }`,
      )

      if (Replacement) {
        this.message(`      replacement:               ${Replacement}`)
      }

      if (Scope && Scope.length > 0) {
        this.message(`      scope:                     ${Scope}`)
      }

      if (Details && Details.length > 0) {
        this.message(`      details:`)
        Details.forEach((detail) => {
          this.message(
            `        - causing entity:        ${detail.CausingEntity}`,
          )
          this.message(`          evaluation:            ${detail.Evaluation}`)
          this.message(
            `          change source:         ${detail.ChangeSource}`,
          )
          this.message(`          target:`)
          this.message(
            `            attribute:           ${detail.Target!.Attribute}`,
          )
          this.message(
            `            name:                ${detail.Target!.Name}`,
          )
          this.message(
            `            require recreation:  ${
              detail.Target!.RequiresRecreation
            }`,
          )
        })
      }
    })

    const addCount = summary.get(ResourceOperation.ADD)!.toString()
    const modifyCount = summary.get(ResourceOperation.UPDATE)!.toString()
    const removeCount = summary.get(ResourceOperation.DELETE)!.toString()
    const replaceCount = summary.get(ResourceOperation.REPLACE)!.toString()

    this.message(
      `add: ${green(addCount)}, update: ${yellow(
        modifyCount,
      )}, replace: ${orange(replaceCount)}, delete: ${red(removeCount)}`,
      true,
      true,
    )
  }

  printParameters = (
    changeSet: DescribeChangeSetOutput | null,
    templateSummary: CloudFormation.GetTemplateSummaryOutput,
    existingStack: CloudFormation.Stack | null,
    existingTemplateSummary: CloudFormation.GetTemplateSummaryOutput | null,
  ): void => {
    if (!changeSet) {
      this.message("No stack parameters to modify.")
      return
    }

    const { updated, added, removed } = buildParametersSpec(
      changeSet,
      templateSummary,
      existingStack,
      existingTemplateSummary,
    )

    const all = [...updated, ...added, ...removed].sort((a, b) =>
      a.key.localeCompare(b.key),
    )
    if (all.length === 0) {
      this.message("No stack parameters to modify.")
      return
    }

    this.message(`${all.length} stack parameters to modify:`)

    all.forEach((param) => {
      this.message(`  ${formatParameterOperation(param)}`, true)
      this.message(`      no echo:   ${param.newNoEcho}`)
      this.message(
        `      current:   ${formatParameterValue(param.currentValue)}`,
      )
      this.message(`      new:       ${formatParameterValue(param.newValue)}`)
    })
  }

  #printTerminationProtection = (
    stack: Stack,
    existingStack: CloudFormation.Stack | null,
  ): void => {
    const protection = stack.isTerminationProtectionEnabled()
      ? green("enabled")
      : red("disabled")
    if (!existingStack) {
      this.message(`Termination protection will be ${protection}`, true)
      return
    }

    if (
      existingStack.EnableTerminationProtection !==
      stack.isTerminationProtectionEnabled()
    ) {
      this.message(`Termination protection will be ${protection}`, true)
    } else {
      this.message("No changes to termination protection")
    }
  }

  confirmStackDeploy = async (
    stack: Stack,
    changeSet: DescribeChangeSetOutput | null,
    templateBody: string,
    templateSummary: CloudFormation.GetTemplateSummaryOutput,
    cloudFormationClient: CloudFormationClient,
    existingStack: CloudFormation.Stack | null,
    existingTemplateSummary: CloudFormation.GetTemplateSummaryOutput | null,
  ): Promise<ConfirmStackDeployAnswer> => {
    if (this.autoConfirm) {
      return ConfirmStackDeployAnswer.CONTINUE
    }

    this.subheader("Review deployment plan for a stack:", true)
    this.longMessage([
      "A stack deployment plan has been created and is shown below.",
      "",
      `  stack path:    ${stack.getPath()}`,
      `  stack name:    ${stack.getName()}`,
      `  stack region:  ${stack.getRegion()}`,
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
    ])

    this.printParameters(
      changeSet,
      templateSummary,
      existingStack,
      existingTemplateSummary,
    )

    this.#printTerminationProtection(stack, existingStack)

    this.printChangeSet(stack.getPath(), changeSet)

    const answer = await this.choose(
      "How do you want to continue the deployment?",
      [
        CONFIRM_STACK_DEPLOY_ANSWER_CANCEL,
        CONFIRM_STACK_DEPLOY_ANSWER_REVIEW_TEMPLATE,
        CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE,
        CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE_AND_SKIP_REMAINING_REVIEWS,
      ],
      true,
    )

    if (answer === ConfirmStackDeployAnswer.REVIEW_TEMPLATE) {
      const currentTemplateBody = await cloudFormationClient.getCurrentTemplate(
        stack.getName(),
      )
      const lines = diffLines(currentTemplateBody, templateBody)
      const diffOutput = lines
        .map((line) => {
          if (line.added) return green(line.value)
          else if (line.removed) return red(line.value)
          else return line.value
        })
        .join("")

      this.message(diffOutput, true)

      const reviewAnswer = await this.choose(
        "How do you want to continue the deployment?",
        [
          CONFIRM_STACK_DEPLOY_ANSWER_CANCEL,
          CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE,
          CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE_AND_SKIP_REMAINING_REVIEWS,
        ],
        true,
      )

      if (
        reviewAnswer ===
        ConfirmStackDeployAnswer.CONTINUE_AND_SKIP_REMAINING_REVIEWS
      ) {
        this.autoConfirm = true
      }

      return reviewAnswer
    }

    if (
      answer === ConfirmStackDeployAnswer.CONTINUE_AND_SKIP_REMAINING_REVIEWS
    ) {
      this.autoConfirm = true
    }

    return answer
  }

  printStackEvent = (
    stackPath: StackPath,
    e: CloudFormation.StackEvent,
  ): void => this.info(stackPath + " - " + formatStackEvent(e))

  private printStackDependencies = (
    stack: Stack,
    ctx: CommandContext,
    depth: number,
  ) => {
    stack.getDependencies().forEach((dependencyPath) => {
      const [dependency] = ctx.getStacksByPath(dependencyPath)
      const padding = " ".repeat(depth)
      const end = dependency.getDependencies().length > 0 ? ":" : ""

      this.message(`${padding}- ${dependencyPath}${end}`)

      this.printStackDependencies(dependency, ctx, depth + 2)
    })
  }
}
