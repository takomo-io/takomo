import { InternalStacksContext } from "../../../context/stacks-context.js"
import { isNotObsolete } from "../../../takomo-stacks-model/util.js"
import { TkmLogger } from "../../../utils/logging.js"
import { loadCurrentCfStacks } from "../common/load-current-cf-stacks.js"
import { ListStacksInput, ListStacksOutput } from "./model.js"

export const listStacks = async (
  ctx: InternalStacksContext,
  input: ListStacksInput,
  logger: TkmLogger,
): Promise<ListStacksOutput> => {
  const { timer, commandPath, outputFormat } = input

  const stacksWithinCommandPath = ctx.stacks
    .filter((stack) => stack.path.startsWith(commandPath))
    .filter(isNotObsolete)

  const stackPairs = await loadCurrentCfStacks(logger, stacksWithinCommandPath)

  const results = stackPairs.map(({ stack, current }) => ({
    path: stack.path,
    name: stack.name,
    status: current?.status,
    createdTime: current?.creationTime,
    updatedTime: current?.lastUpdatedTime,
  }))

  return {
    success: true,
    status: "SUCCESS",
    message: "Success",
    outputFormat,
    timer: timer.stop(),
    results,
  }
}
