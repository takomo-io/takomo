import { InternalStacksContext } from "../../../context/stacks-context.js"
import { StackStatus } from "../../../aws/cloudformation/model.js"
import { isNotObsolete } from "../../../takomo-stacks-model/util.js"
import { TkmLogger } from "../../../utils/logging.js"
import {
  isCustomStackPair,
  isStandardStackPair,
  loadCurrentStacks,
} from "../common/load-current-cf-stacks.js"
import { ListStacksInput, ListStacksOutput, StackInfo } from "./model.js"

export const listStacks = async (
  ctx: InternalStacksContext,
  input: ListStacksInput,
  logger: TkmLogger,
): Promise<ListStacksOutput> => {
  const { timer, commandPath, outputFormat } = input

  const stacksWithinCommandPath = ctx.stacks
    .filter((stack) => stack.path.startsWith(commandPath))
    .filter(isNotObsolete)

  const stackPairs = await loadCurrentStacks(
    logger,
    stacksWithinCommandPath,
    ctx,
  )

  const results: ReadonlyArray<StackInfo> = stackPairs.map((pair) => {
    if (isCustomStackPair(pair)) {
      return {
        path: pair.stack.path,
        name: pair.stack.name,
        type: "custom",
        status: (pair.currentState
          ? "CREATE_COMPLETE"
          : "PENDING") as StackStatus,
        createdTime: pair.currentState?.creationTime,
        updatedTime: pair.currentState?.lastUpdatedTime,
      }
    }

    if (isStandardStackPair(pair)) {
      return {
        path: pair.stack.path,
        name: pair.stack.name,
        type: "standard",
        status: pair.currentStack?.status,
        createdTime: pair.currentStack?.creationTime,
        updatedTime: pair.currentStack?.lastUpdatedTime,
      }
    }

    throw new Error(`Unknown stack pair type`)
  })

  return {
    success: true,
    status: "SUCCESS",
    message: "Success",
    outputFormat,
    timer: timer.stop(),
    results,
  }
}
