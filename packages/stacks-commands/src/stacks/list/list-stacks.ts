import { InternalStacksContext } from "@takomo/stacks-model"
import { ListStacksInput, ListStacksOutput } from "./model"

/**
 * @hidden
 */
export const listStacks = async (
  ctx: InternalStacksContext,
  input: ListStacksInput,
): Promise<ListStacksOutput> => {
  const { timer } = input
  const stacks = await Promise.all(
    ctx.stacks
      .filter((stack) => stack.path.startsWith(input.commandPath))
      .map(async (stack) => {
        const current = await stack.getCurrentCloudFormationStack()
        return { stack, current }
      }),
  )

  timer.stop()

  return {
    success: true,
    status: "SUCCESS",
    message: "Success",
    outputFormat: input.outputFormat,
    timer,
    stacks,
  }
}
