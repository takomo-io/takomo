import { StackEvent } from "@takomo/aws-model"
import {
  ConfirmUndeployAnswer,
  StacksOperationOutput,
  StacksUndeployPlan,
  StackUndeployOperationType,
  UndeployStacksIO,
  UndeployStacksListener,
} from "@takomo/stacks-commands"
import { InternalStack, StackGroup, StackPath } from "@takomo/stacks-model"
import { grey, red } from "@takomo/util"
import R from "ramda"
import { createBaseIO } from "../cli-io"
import { formatStackEvent, formatStackStatus } from "../formatters"
import {
  chooseCommandPathInternal,
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

export interface UndeployStacksIOProps
  extends IOProps,
    Partial<UndeployStacksListener> {}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOpListener = async () => {}

export const createUndeployStacksIO = (
  props: UndeployStacksIOProps,
): UndeployStacksIO => {
  const {
    logger,
    onStackUndeployBegin = noOpListener,
    onStackUndeployComplete = noOpListener,
  } = props
  const io = createBaseIO(props)

  const confirmUndeploy = async ({
    operations,
  }: StacksUndeployPlan): Promise<ConfirmUndeployAnswer> => {
    io.subheader({ text: "Review stacks undeployment plan:", marginTop: true })
    io.longMessage(
      [
        "A stacks undeployment plan has been created and is shown below.",
        "Stacks will be undeployed in the order they are listed, and in parallel when possible.",
        "",
        `Following stacks will be undeployed:`,
      ],
      false,
      false,
      0,
    )

    const stacksMap = new Map(
      operations.map((o) => o.stack).map((s) => [s.path, s]),
    )

    const maxStackPathLength = R.apply(
      Math.max,
      operations.map((o) => o.stack.path.length),
    )

    const stackPathColumnLength = Math.max(27, maxStackPathLength)

    for (const { stack, currentStack, type } of operations) {
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

      if (stack.dependents.length > 0) {
        io.message({ text: "      dependents:" })
        printStackDependents(stack, stacksMap, 8)
      } else {
        io.message({ text: "      dependents:                none" })
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

    io.message({
      text: `stacks | total: ${operations.length}, ${counts}`,
      marginTop: true,
      indent: 2,
    })

    return await io.choose(
      "Continue to undeploy the stacks?",
      [CONFIRM_UNDEPLOY_ANSWER_CANCEL, CONFIRM_UNDEPLOY_ANSWER_CONTINUE],
      true,
    )
  }

  const printStackEvent = (stackPath: StackPath, e: StackEvent): void =>
    logger.info(stackPath + " - " + formatStackEvent(e))

  const printOutput = (output: StacksOperationOutput): StacksOperationOutput =>
    printStacksOperationOutput(io, output, logger.logLevel)

  const printStackDependents = (
    stack: InternalStack,
    stacksMap: Map<StackPath, InternalStack>,
    depth: number,
  ) => {
    stack.dependents.forEach((dependentPath) => {
      const dependent = stacksMap.get(dependentPath)
      if (!dependent) {
        throw new Error(`Dependency ${dependentPath} was not found`)
      }

      const padding = " ".repeat(depth)
      const end = dependent.dependencies.length > 0 ? ":" : ""
      io.message({ text: `${padding}- ${dependentPath}${end}` })
      printStackDependents(dependent, stacksMap, depth + 2)
    })
  }

  const chooseCommandPath = (rootStackGroup: StackGroup) =>
    chooseCommandPathInternal(io, rootStackGroup)

  return {
    ...logger,
    ...io,
    onStackUndeployBegin,
    onStackUndeployComplete,
    printOutput,
    chooseCommandPath,
    printStackEvent,
    confirmUndeploy,
  }
}
