import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandPath, StackPath } from "@takomo/core"
import { Stack, StackLaunchType } from "@takomo/stacks-model"
import { Logger, randomInt, sleep, TakomoError } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { StackStatus } from "aws-sdk/clients/cloudformation"
import { Policy } from "cockatiel"

export const resolveStackLaunchType = (
  status: StackStatus | null,
): StackLaunchType => {
  if (status === null) {
    return StackLaunchType.CREATE
  }

  switch (status) {
    case "CREATE_COMPLETE":
    case "UPDATE_COMPLETE":
    case "UPDATE_ROLLBACK_COMPLETE":
      return StackLaunchType.UPDATE
    case "CREATE_FAILED":
    case "ROLLBACK_COMPLETE":
      return StackLaunchType.RECREATE
    case "REVIEW_IN_PROGRESS":
      return StackLaunchType.CREATE
    default:
      throw new Error(`Unsupported stack status: ${status}`)
  }
}

export const isStackGroupPath = (commandPath: CommandPath): boolean =>
  !commandPath.includes(".yml")

export const loadExistingStacks = async (
  logger: Logger,
  stacks: Stack[],
): Promise<Map<StackPath, CloudFormation.Stack>> => {
  logger.info("Load existing stacks")

  const bulkhead = Policy.bulkhead(2, 10000)

  const map = new Map<StackPath, CloudFormation.Stack>()

  await Promise.all(
    stacks.map(async (stack, i) => {
      logger.debug(
        `Load existing stack with path: ${stack.getPath()}, name: ${stack.getName()}`,
      )
      const cf = new CloudFormationClient({
        credentialProvider: stack.getCredentialProvider(),
        region: stack.getRegion(),
        logger,
      })

      const minSleep = i * 50
      await sleep(randomInt(minSleep, minSleep + 50))

      await bulkhead.execute(async () => {
        const existingStack = await cf.describeStack(stack.getName())
        if (existingStack) {
          logger.debug(
            `Existing stack found with path: ${stack.getPath()}, name: ${stack.getName()}`,
          )
          map.set(stack.getPath(), existingStack)
        } else {
          logger.debug(
            `No existing stack found with path: ${stack.getPath()}, name: ${stack.getName()}`,
          )
        }
      })
    }),
  )

  return map
}

export const validateStackCredentialProvidersWithAllowedAccountIds = async (
  stacks: Stack[],
): Promise<void> => {
  const stacksWithIdentities = await Promise.all(
    stacks.map(async (stack) => {
      const identity = await stack.getCredentialProvider().getCallerIdentity()
      return { stack, identity }
    }),
  )

  stacksWithIdentities.forEach(({ stack, identity }) => {
    if (
      stack.getAccountIds().length > 0 &&
      !stack.getAccountIds().includes(identity.accountId)
    ) {
      const allowedAccountIds = stack
        .getAccountIds()
        .map((a) => `- ${a}`)
        .join("\n")
      throw new TakomoError(
        `Credentials associated with the stack ${stack.getPath()} point to an AWS account with id ${
          identity.accountId
        } which is not allowed in stack configuration.\n\nList of allowed account ids:\n\n${allowedAccountIds}`,
      )
    }
  })
}
