import * as R from "ramda"
import {
  DetailedChangeSet,
  DetailedCloudFormationStack,
  StackEvent,
  TemplateBody,
  TemplateSummary,
} from "../../../aws/cloudformation/model.js"
import { StackOperationType } from "../../../command/command-model.js"
import {
  ConfirmCustomStackDeployAnswer,
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  DeployStacksIO,
} from "../../../command/stacks/deploy/model.js"
import {
  isCustomStackDeployOperation,
  isStandardStackDeployOperation,
  StacksDeployPlan,
} from "../../../command/stacks/deploy/plan.js"
import { StacksOperationOutput } from "../../../command/stacks/model.js"
import { StackGroup } from "../../../stacks/stack-group.js"
import { InternalStandardStack } from "../../../stacks/standard-stack.js"
import { bold, green, orange, yellow } from "../../../utils/colors.js"
import { diffStrings } from "../../../utils/strings.js"
import { createBaseIO } from "../../cli-io.js"
import {
  formatCustomStackStatus,
  formatStackEvent,
  formatStandardStackStatus,
} from "../../formatters.js"
import {
  chooseCommandPathInternal,
  createStacksOperationListenerInternal,
  formatCustomStackLastModify,
  formatLastModify,
  formatStackType,
  IOProps,
  printStacksOperationOutput,
} from "../common.js"
import { printOutputs } from "./outputs.js"
import { printCustomStackParameters, printParameters } from "./parameters.js"
import { printResources } from "./resources.js"
import { printStackPolicy } from "./stack-policy.js"
import { printCustomStackTags, printTags } from "./tags.js"
import { printTerminationProtection } from "./termination-protection.js"
import { StackPath } from "../../../stacks/stack.js"
import { InternalCustomStack } from "../../../stacks/custom-stack.js"
import {
  CustomStackState,
  Parameters,
  Tags,
} from "../../../custom-stacks/custom-stack-handler.js"

interface ConfirmStackDeployAnswerChoice {
  readonly name: string
  readonly value: ConfirmStackDeployAnswer
}

interface ConfirmCustomStackDeployAnswerChoice {
  readonly name: string
  readonly value: ConfirmCustomStackDeployAnswer
}

interface ConfirmDeployAnswerChoice {
  readonly name: string
  readonly value: ConfirmDeployAnswer
}

export const CONFIRM_STACK_DEPLOY_ANSWER_CANCEL: ConfirmStackDeployAnswerChoice =
  {
    name: "cancel deploy of this stack and all remaining stacks",
    value: "CANCEL",
  }

export const CONFIRM_STACK_DEPLOY_ANSWER_REVIEW_TEMPLATE: ConfirmStackDeployAnswerChoice =
  {
    name: "review changes in the stack template",
    value: "REVIEW_TEMPLATE",
  }

export const CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE: ConfirmStackDeployAnswerChoice =
  {
    name: "continue to deploy the stack, then let me review the remaining stacks",
    value: "CONTINUE",
  }

export const CONFIRM_STACK_DEPLOY_ANSWER_CONTINUE_AND_SKIP_REMAINING_REVIEWS: ConfirmStackDeployAnswerChoice =
  {
    name: "continue to deploy the stack, then deploy the remaining stacks without reviewing changes",
    value: "CONTINUE_AND_SKIP_REMAINING_REVIEWS",
  }

export const CONFIRM_CUSTOM_STACK_DEPLOY_ANSWER_CANCEL: ConfirmCustomStackDeployAnswerChoice =
  {
    name: "cancel deploy of this stack and all remaining stacks",
    value: "CANCEL",
  }

export const CONFIRM_CUSTOM_STACK_DEPLOY_ANSWER_CONTINUE: ConfirmCustomStackDeployAnswerChoice =
  {
    name: "continue to deploy the stack, then let me review the remaining stacks",
    value: "CONTINUE",
  }

export const CONFIRM_CUSTOM_STACK_DEPLOY_ANSWER_CONTINUE_AND_SKIP_REMAINING_REVIEWS: ConfirmCustomStackDeployAnswerChoice =
  {
    name: "continue to deploy the stack, then deploy the remaining stacks without reviewing changes",
    value: "CONTINUE_AND_SKIP_REMAINING_REVIEWS",
  }

export const CONFIRM_DEPLOY_ANSWER_CANCEL: ConfirmDeployAnswerChoice = {
  name: "cancel deployment",
  value: "CANCEL",
}

export const CONFIRM_DEPLOY_ANSWER_CONTINUE_AND_REVIEW: ConfirmDeployAnswerChoice =
  {
    name: "continue, but let me review changes to each stack",
    value: "CONTINUE_AND_REVIEW",
  }

export const CONFIRM_DEPLOY_ANSWER_CONTINUE_NO_REVIEW: ConfirmDeployAnswerChoice =
  {
    name: "continue, deploy all stacks without reviewing changes",
    value: "CONTINUE_NO_REVIEW",
  }

const formatStackOperation = (
  stackPath: StackPath,
  type: StackOperationType,
  columnLength: number,
): string => {
  switch (type) {
    case "CREATE":
      const createKey = `+ ${stackPath}:`.padEnd(columnLength + 4)
      return green(`${createKey}(stack will be created)`)
    case "RECREATE":
      const recreateKey = `± ${stackPath}:`.padEnd(columnLength + 4)
      return orange(`${recreateKey}(stack will be replaced)`)
    case "UPDATE":
      const updateKey = `~ ${stackPath}:`.padEnd(columnLength + 4)
      return yellow(`${updateKey}(stack will be updated)`)
    default:
      throw new Error(`Unsupported stack operation type: '${type}'`)
  }
}

const formatStackOperationType = (type: StackOperationType): string => {
  switch (type) {
    case "CREATE":
      return green("CREATE")
    case "RECREATE":
      return orange("RECREATE")
    case "UPDATE":
      return yellow("UPDATE")
    default:
      throw new Error(`Unsupported stack operation type: '${type}'`)
  }
}

const ensureContentsEndsWithLineFeed = (content: string): string =>
  content.endsWith("\n") ? content : content + "\n"

export interface DeployStacksIOProps extends IOProps {
  readonly target?: string
}

export const createDeployStacksIO = (
  props: DeployStacksIOProps,
): DeployStacksIO => {
  const { logger, target } = props
  const io = createBaseIO(props)

  // TODO: Come up some other solution
  let autoConfirmEnabled = false

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
        "Stacks will be deployed in the order they are listed, and in parallel when possible.",
      ],
      false,
      false,
      0,
    )

    io.message({
      text: "Following stacks will be deployed:",
      marginTop: true,
    })

    const maxStackPathLength = R.apply(
      Math.max,
      operations.map((o) => o.stack.path.length),
    )

    const stackPathColumnLength = Math.max(27, maxStackPathLength)

    for (const operation of operations) {
      const stackIdentity =
        await operation.stack.credentialManager.getCallerIdentity()

      if (isStandardStackDeployOperation(operation)) {
        const { stack, type, currentStack } = operation

        io.longMessage(
          [
            `  ${formatStackOperation(stack.path, type, stackPathColumnLength)}`,
            `      name:                      ${stack.name}`,
            `      type:                      ${formatStackType(stack)}`,
            `      status:                    ${formatStandardStackStatus(
              currentStack?.status,
            )}`,
            `      last change:               ${formatLastModify(currentStack)}`,
            `      account id:                ${stackIdentity.accountId}`,
            `      region:                    ${stack.region}`,
            "      credentials:",
            `        user id:                 ${stackIdentity.userId}`,
            `        account id:              ${stackIdentity.accountId}`,
            `        arn:                     ${stackIdentity.arn}`,
          ],
          true,
          false,
          0,
        )
      }

      if (isCustomStackDeployOperation(operation)) {
        const { stack, type, currentState } = operation

        io.longMessage(
          [
            `  ${formatStackOperation(stack.path, type, stackPathColumnLength)}`,
            `      name:                      ${stack.name}`,
            `      type:                      ${formatStackType(stack)}`,
            `      status:                    ${formatCustomStackStatus(
              currentState.status,
            )}`,
            `      last change:               ${formatCustomStackLastModify(currentState)}`,
            `      account id:                ${stackIdentity.accountId}`,
            `      region:                    ${stack.region}`,
            "      credentials:",
            `        user id:                 ${stackIdentity.userId}`,
            `        account id:              ${stackIdentity.accountId}`,
            `        arn:                     ${stackIdentity.arn}`,
          ],
          true,
          false,
          0,
        )
      }

      if (operation.stack.dependencies.length > 0) {
        io.message({ text: "dependencies:", indent: 6 })
        operation.stack.dependencies
          .map((d) => `- ${d}`)
          .forEach((d) => {
            io.message({ text: d, indent: 8 })
          })
      } else {
        io.message({ text: "dependencies:              none", indent: 6 })
      }
    }

    const operationCounts = R.countBy((o) => o.type, operations)
    const counts = Object.entries(operationCounts)
      .map(([key, count]) => {
        switch (key) {
          case "CREATE":
            return { order: "1", text: green(`create: ${count}`) }
          case "UPDATE":
            return { order: "2", text: yellow(`update: ${count}`) }
          case "RECREATE":
            return { order: "3", text: orange(`replace: ${count}`) }
          default:
            throw new Error(`Unsupported operation ${key}`)
        }
      })
      .sort((a, b) => a.order.localeCompare(b.order))
      .map((o) => o.text)
      .join(", ")

    if (operations.length > 1) {
      io.message({
        text: `stacks | total: ${operations.length}, ${counts}`,
        marginTop: true,
        indent: 2,
      })
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
    printStacksOperationOutput({
      io,
      output,
      logLevel: logger.logLevel,
      target,
    })

  const confirmStackDeploy = async (
    stack: InternalStandardStack,
    templateBody: TemplateBody,
    templateSummary: TemplateSummary,
    operationType: StackOperationType,
    existingStack?: DetailedCloudFormationStack,
    changeSet?: DetailedChangeSet,
  ): Promise<ConfirmStackDeployAnswer> => {
    if (autoConfirmEnabled) {
      return "CONTINUE"
    }

    io.subheader({
      text: "Review deployment plan for a standard stack:",
      marginTop: true,
    })
    io.longMessage(
      [
        "A stack deployment plan has been created and is shown below.",
        "",
        `  path:                          ${stack.path}`,
        `  name:                          ${stack.name}`,
        `  type:                          ${formatStackType(stack)}`,
        `  region:                        ${stack.region}`,
        `  operation:                     ${formatStackOperationType(
          operationType,
        )}`,
      ],
      false,
      false,
      0,
    )

    printTerminationProtection(io, stack, existingStack)
    printStackPolicy(io, stack, existingStack)

    const parametersChanged = printParameters(io, changeSet, existingStack)
    const tagsChanged = printTags(io, changeSet, existingStack)
    const resourcesChanged = printResources(io, changeSet)

    if (changeSet && !parametersChanged && !tagsChanged && !resourcesChanged) {
      printOutputs(io)
    }

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
      const client = await stack.getCloudFormationClient()
      const currentTemplateBody = await client.getCurrentTemplate(stack.name)

      const safeCurrentTemplateBody =
        ensureContentsEndsWithLineFeed(currentTemplateBody)
      const safeTemplateBody = ensureContentsEndsWithLineFeed(templateBody)

      io.message({ text: bold("Changes to template:"), marginTop: true })

      if (safeCurrentTemplateBody === safeTemplateBody) {
        io.message({
          text: "No changes to template",
          marginTop: true,
          indent: 2,
        })
      } else {
        const diffOutput = diffStrings(
          safeCurrentTemplateBody,
          safeTemplateBody,
        )
        io.message({ text: diffOutput, marginTop: true, indent: 2 })
      }

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

  const confirmCustomStackDeploy = async (
    stack: InternalCustomStack,
    operationType: StackOperationType,
    currentState: CustomStackState,
    tags: Tags,
    parameters: Parameters,
  ): Promise<ConfirmCustomStackDeployAnswer> => {
    if (autoConfirmEnabled) {
      return "CONTINUE"
    }

    io.subheader({
      text: "Review deployment plan for a custom stack:",
      marginTop: true,
    })
    io.longMessage(
      [
        "A stack deployment plan has been created and is shown below.",
        "",
        `  path:                          ${stack.path}`,
        `  name:                          ${stack.name}`,
        `  type:                          ${formatStackType(stack)}`,
        `  region:                        ${stack.region}`,
        `  operation:                     ${formatStackOperationType(
          operationType,
        )}`,
      ],
      false,
      false,
      0,
    )

    printCustomStackParameters(io, parameters, currentState.parameters)
    printCustomStackTags(io, tags, currentState.tags)

    const answer = await io.choose<ConfirmCustomStackDeployAnswer>(
      "How do you want to continue the deployment?",
      [
        CONFIRM_CUSTOM_STACK_DEPLOY_ANSWER_CANCEL,
        CONFIRM_CUSTOM_STACK_DEPLOY_ANSWER_CONTINUE,
        CONFIRM_CUSTOM_STACK_DEPLOY_ANSWER_CONTINUE_AND_SKIP_REMAINING_REVIEWS,
      ],
      true,
    )

    if (answer === "CONTINUE_AND_SKIP_REMAINING_REVIEWS") {
      autoConfirmEnabled = true
    }

    return answer
  }

  const printStackEvent = (stackPath: StackPath, e: StackEvent): void =>
    logger.info(stackPath + " - " + formatStackEvent(e))

  const chooseCommandPath = (rootStackGroup: StackGroup) =>
    chooseCommandPathInternal(io, rootStackGroup)

  const createStacksOperationListener = (stackCount: number) =>
    createStacksOperationListenerInternal(logger, "deploy", stackCount)

  return {
    ...logger,
    ...io,
    chooseCommandPath,
    confirmDeploy,
    confirmStackDeploy,
    confirmCustomStackDeploy,
    printOutput,
    printStackEvent,
    createStacksOperationListener,
  }
}
