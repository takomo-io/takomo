import { InternalStacksContext } from "@takomo/stacks-model"
import { ListStacksInput, ListStacksOutput } from "./model"

/**
 * @hidden
 */
export const listStacks = async (
  ctx: InternalStacksContext,
  input: ListStacksInput,
): Promise<ListStacksOutput> => {
  const { timer, commandPath, outputFormat } = input
  const stacks = await Promise.all(
    ctx.stacks
      .filter((stack) => stack.path.startsWith(commandPath))
      .sort((a, b) => a.path.localeCompare(b.path))
      .map(async (stack) => {
        const current = await stack.getCurrentCloudFormationStack()
        return {
          path: stack.path,
          name: stack.name,
          status: current?.status,
          createdTime: current?.creationTime,
          updatedTime: current?.lastUpdatedTime,
        }
      }),
  )

  timer.stop()

  return {
    success: true,
    status: "SUCCESS",
    message: "Success",
    outputFormat,
    timer,
    stacks,
  }
}
