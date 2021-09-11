import { InternalStacksContext } from "@takomo/stacks-model"
import { TkmLogger } from "@takomo/util"
import { loadCurrentCfStacks } from "../common/load-current-cf-stacks"
import { ListStacksInput, ListStacksOutput } from "./model"

/**
 * @hidden
 */
export const listStacks = async (
  ctx: InternalStacksContext,
  input: ListStacksInput,
  logger: TkmLogger,
): Promise<ListStacksOutput> => {
  const { timer, commandPath, outputFormat } = input

  const stacksWithinCommandPath = ctx.stacks.filter((stack) =>
    stack.path.startsWith(commandPath),
  )

  const stackPairs = await loadCurrentCfStacks(logger, stacksWithinCommandPath)

  const results = stackPairs.map(({ stack, current }) => ({
    path: stack.path,
    name: stack.name,
    status: current?.status,
    createdTime: current?.creationTime,
    updatedTime: current?.lastUpdatedTime,
  }))

  timer.stop()

  return {
    success: true,
    status: "SUCCESS",
    message: "Success",
    outputFormat,
    timer,
    results,
  }
}
