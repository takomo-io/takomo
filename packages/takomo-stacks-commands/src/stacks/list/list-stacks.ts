import { CommandStatus } from "@takomo/core"
import { CommandContext } from "@takomo/stacks-model"
import { ListStacksInput, ListStacksOutput } from "./model"

export const listStacks = async (
  ctx: CommandContext,
  input: ListStacksInput,
): Promise<ListStacksOutput> => {
  const stacks = await Promise.all(
    ctx
      .getStacksToProcess()
      .filter((stack) => stack.getPath().startsWith(input.commandPath))
      .map(async (stack) => {
        const current = await ctx.getExistingStack(stack.getPath())
        return { stack, current }
      }),
  )

  return {
    success: true,
    status: CommandStatus.SUCCESS,
    message: "Success",
    watch: input.watch.stop(),
    stacks,
  }
}
