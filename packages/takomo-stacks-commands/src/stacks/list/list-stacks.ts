import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandStatus } from "@takomo/core"
import { CommandContext } from "@takomo/stacks"
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
        const cf = new CloudFormationClient({
          credentialProvider: stack.getCredentialProvider(),
          logger: ctx.getLogger(),
          region: stack.getRegion(),
        })

        const current = await cf.describeStack(stack.getName())
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
