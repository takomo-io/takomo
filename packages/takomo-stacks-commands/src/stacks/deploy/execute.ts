import { CommandStatus } from "@takomo/core"
import { defaultCapabilities, StackResult } from "@takomo/stacks"
import uuid from "uuid"
import { StackLaunchType, TagsHolder } from "./model"
import { waitForStackCreateOrUpdateToComplete } from "./wait"

export const createOrUpdateStack = async (
  holder: TagsHolder,
): Promise<StackResult> => {
  const {
    stack,
    launchType,
    cloudFormationClient,
    parameters,
    tags,
    templateS3Url,
    templateBody,
    watch,
    logger,
  } = holder

  const clientToken = uuid.v4()
  const templateLocation = templateS3Url || templateBody
  const templateKey = templateS3Url ? "TemplateURL" : "TemplateBody"
  const capabilities = stack.getCapabilities() || defaultCapabilities

  switch (launchType) {
    case StackLaunchType.UPDATE:
      logger.info("Update stack")
      const updateWatch = watch.startChild("update-stack")
      try {
        const hasChanges = await cloudFormationClient.updateStack({
          Capabilities: capabilities,
          ClientRequestToken: clientToken,
          Parameters: parameters,
          Tags: tags,
          StackName: stack.getName(),
          [templateKey]: templateLocation,
        })

        if (!hasChanges) {
          logger.info("No changes")
          return {
            stack,
            message: "No changes",
            reason: "SKIPPED",
            status: CommandStatus.SKIPPED,
            events: [],
            success: true,
            watch: watch.stop(),
          }
        }
      } catch (e) {
        logger.error("Failed to update stack", e)
        return {
          stack,
          message: e.message,
          reason: "UPDATE_FAILED",
          status: CommandStatus.FAILED,
          events: [],
          success: false,
          watch: watch.stop(),
        }
      }

      updateWatch.stop()

      return waitForStackCreateOrUpdateToComplete({
        ...holder,
        clientToken,
      })

    case StackLaunchType.CREATE:
      logger.info("Create stack")
      const createWatch = watch.startChild("create-stack")

      try {
        await cloudFormationClient.createStack({
          Capabilities: capabilities,
          ClientRequestToken: clientToken,
          DisableRollback: false,
          EnableTerminationProtection: false,
          Parameters: parameters,
          Tags: tags,
          StackName: stack.getName(),
          TimeoutInMinutes: stack.getTimeout().create || undefined,
          [templateKey]: templateLocation,
        })
      } catch (e) {
        logger.error("Failed to create stack", e)
        return {
          stack,
          message: e.message,
          reason: "CREATE_FAILED",
          status: CommandStatus.FAILED,
          events: [],
          success: false,
          watch: watch.stop(),
        }
      }

      createWatch.stop()

      return await waitForStackCreateOrUpdateToComplete({
        ...holder,
        clientToken,
      })

    default:
      throw new Error(`Unknown launch type: ${launchType}`)
  }
}
