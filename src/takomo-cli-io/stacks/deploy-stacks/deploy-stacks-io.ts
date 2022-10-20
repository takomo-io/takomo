import R from "ramda"
import {
  DetailedChangeSet,
  DetailedCloudFormationStack,
  StackEvent,
  TemplateBody,
  TemplateSummary,
} from "../../../takomo-aws-model"
import {
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  DeployStacksIO,
  StacksDeployPlan,
  StacksOperationOutput,
} from "../../../takomo-stacks-commands"
import {
  InternalStack,
  StackGroup,
  StackOperationType,
  StackPath,
} from "../../../takomo-stacks-model"
import { bold, diffStrings, green, orange, yellow } from "../../../takomo-util"
import { createBaseIO } from "../../cli-io"
import { formatStackEvent, formatStackStatus } from "../../formatters"
import {
  chooseCommandPathInternal,
  createStacksOperationListenerInternal,
  IOProps,
  printStacksOperationOutput,
} from "../common"
import { printOutputs } from "./outputs"
import { printParameters } from "./parameters"
import { printResources } from "./resources"
import { printStackPolicy } from "./stack-policy"
import { printTags } from "./tags"
import { printTerminationProtection } from "./termination-protection"

interface ConfirmStackDeployAnswerChoice {
  readonly name: string
  readonly value: ConfirmStackDeployAnswer
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

export type DeployStacksIOProps = IOProps

export const createDeployStacksIO = (
  props: DeployStacksIOProps,
): DeployStacksIO => {
  const { logger } = props
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

    for (const { stack, type, currentStack } of operations) {
      const stackIdentity = await stack.credentialManager.getCallerIdentity()
      io.longMessage(
        [
          `  ${formatStackOperation(stack.path, type, stackPathColumnLength)}`,
          `      name:                      ${stack.name}`,
          `      status:                    ${formatStackStatus(
            currentStack?.status,
          )}`,
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

      if (stack.dependencies.length > 0) {
        io.message({ text: "dependencies:", indent: 6 })
        stack.dependencies
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
    printStacksOperationOutput(io, output, logger.logLevel)

  const confirmStackDeploy = async (
    stack: InternalStack,
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
      text: "Review deployment plan for a stack:",
      marginTop: true,
    })
    io.longMessage(
      [
        "A stack deployment plan has been created and is shown below.",
        "",
        `  stack path:                    ${stack.path}`,
        `  stack name:                    ${stack.name}`,
        `  stack region:                  ${stack.region}`,
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
    printOutput,
    printStackEvent,
    createStacksOperationListener,
  }
}
