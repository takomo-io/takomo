import { CommandPath, InternalStack } from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"

/**
 * @hidden
 */
export const isStackGroupPath = (commandPath: CommandPath): boolean =>
  !commandPath.includes(".yml")

/**
 * @hidden
 */
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

/**
 * @hidden
 */
export const isWithinCommandPath = (
  commandPath: CommandPath,
  other: CommandPath,
): boolean => commandPath.startsWith(other.substr(0, commandPath.length))
