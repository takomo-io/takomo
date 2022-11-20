import R from "ramda"
import { StackEvent } from "../../takomo-aws-model/cloudformation"
import {
  ConfirmUndeployAnswer,
  StacksOperationOutput,
  StacksUndeployPlan,
  StackUndeployOperationType,
  UndeployStacksIO,
} from "../../takomo-stacks-commands"
import { StackGroup, StackPath } from "../../takomo-stacks-model"
import { grey, red } from "../../utils/colors"
import { createBaseIO } from "../cli-io"
import { formatStackEvent, formatStackStatus } from "../formatters"
import {
  chooseCommandPathInternal,
  createStacksOperationListenerInternal,
  IOProps,
  printStacksOperationOutput,
} from "./common"

interface ConfirmUndeployAnswerOption {
  readonly name: string
  readonly value: ConfirmUndeployAnswer
}

export const CONFIRM_UNDEPLOY_ANSWER_CANCEL: ConfirmUndeployAnswerOption = {
  name: "no",
  value: "CANCEL",
}

export const CONFIRM_UNDEPLOY_ANSWER_CONTINUE: ConfirmUndeployAnswerOption = {
  name: "yes",
  value: "CONTINUE",
}

const formatStackOperation = (
  stackPath: StackPath,
  type: StackUndeployOperationType,
  columnLength: number,
): string => {
  switch (type) {
    case "DELETE":
      const removeKey = `- ${stackPath}:`.padEnd(columnLength + 4)
      return red(`${removeKey}(stack will be removed)`)
    case "SKIP":
      const skipKey = `* ${stackPath}:`.padEnd(columnLength + 4)
      return grey(`${skipKey}(stack not found and will be skipped)`)
    default:
      throw new Error(`Unsupported stack operation type: '${type}'`)
  }
}

const getConfirmUndeployHeader = (prune: boolean): string =>
  prune ? "Review stacks prune plan:" : "Review stacks undeployment plan:"

const getConfirmUndeployText = (prune: boolean): ReadonlyArray<string> =>
  prune
    ? [
        "A stacks prune plan has been created and is shown below.",
        "Stacks marked as obsolete will be undeployed in the order they",
        "are listed, and in parallel when possible.",
        "",
        "Following stacks will be undeployed:",
      ]
    : [
        "A stacks undeployment plan has been created and is shown below.",
        "Stacks will be undeployed in the order they are listed, and in",
        "parallel when possible.",
        "",
        "Following stacks will be undeployed:",
      ]

export interface UndeployStacksIOProps extends IOProps {
  readonly target?: string
}

export const createUndeployStacksIO = (
  props: UndeployStacksIOProps,
): UndeployStacksIO => {
  const { logger, target } = props
  const io = createBaseIO(props)

  const confirmUndeploy = async ({
    operations,
    prune,
  }: StacksUndeployPlan): Promise<ConfirmUndeployAnswer> => {
    io.subheader({ text: getConfirmUndeployHeader(prune), marginTop: true })
    io.longMessage(getConfirmUndeployText(prune), false, false, 0)

    const maxStackPathLength = R.apply(
      Math.max,
      operations.map((o) => o.stack.path.length),
    )

    const stackPathColumnLength = Math.max(27, maxStackPathLength)

    for (const { stack, currentStack, type, dependents } of operations) {
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

      if (dependents.length > 0) {
        io.message({ text: "dependents:", indent: 6 })
        dependents.forEach((d) => {
          io.message({ text: `- ${d}`, indent: 8 })
        })
      } else {
        io.message({ text: "dependents:                none", indent: 6 })
      }
    }

    const operationCounts = R.countBy((o) => o.type, operations)
    const counts = Object.entries(operationCounts)
      .map(([key, count]) => {
        switch (key) {
          case "DELETE":
            return { order: "1", text: red(`remove: ${count}`) }
          case "SKIP":
            return { order: "2", text: grey(`skip: ${count}`) }
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

    return await io.choose(
      "Continue to undeploy the stacks?",
      [CONFIRM_UNDEPLOY_ANSWER_CANCEL, CONFIRM_UNDEPLOY_ANSWER_CONTINUE],
      true,
    )
  }

  const printStackEvent = (stackPath: StackPath, e: StackEvent): void =>
    logger.info(stackPath + " - " + formatStackEvent(e))

  const printOutput = (output: StacksOperationOutput): StacksOperationOutput =>
    printStacksOperationOutput({
      io,
      output,
      logLevel: logger.logLevel,
      target,
    })

  const chooseCommandPath = (rootStackGroup: StackGroup) =>
    chooseCommandPathInternal(io, rootStackGroup)

  const createStacksOperationListener = (stackCount: number) =>
    createStacksOperationListenerInternal(logger, "undeploy", stackCount)

  return {
    ...logger,
    ...io,
    printOutput,
    chooseCommandPath,
    printStackEvent,
    confirmUndeploy,
    createStacksOperationListener,
  }
}
