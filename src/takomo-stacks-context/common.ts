import { CommandPath } from "../command/command-model"
import { InternalStack } from "../stacks/stack"
import { TakomoError } from "../utils/errors"

export const isStackGroupPath = (commandPath: CommandPath): boolean =>
  !commandPath.includes(".yml")

export const validateStackCredentialManagersWithAllowedAccountIds = async (
  stacks: ReadonlyArray<InternalStack>,
): Promise<void> => {
  const stacksWithIdentities = await Promise.all(
    stacks.map(async (stack) => {
      const identity = await stack.credentialManager.getCallerIdentity()
      return { stack, identity }
    }),
  )

  stacksWithIdentities.forEach(({ stack, identity }) => {
    if (
      stack.accountIds.length > 0 &&
      !stack.accountIds.includes(identity.accountId)
    ) {
      const allowedAccountIds = stack.accountIds.map((a) => `- ${a}`).join("\n")
      throw new TakomoError(
        `Credentials associated with the stack ${stack.path} point to an AWS account with id ${identity.accountId} which is not allowed in stack configuration.\n\nList of allowed account ids:\n\n${allowedAccountIds}`,
      )
    }
  })
}
