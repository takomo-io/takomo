import { CommandStatus } from "@takomo/core"
import {
  defaultCapabilities,
  StackLaunchType,
  StackResult,
} from "@takomo/stacks-model"
import uuid from "uuid"
import { executeAfterLaunchHooks } from "./hooks"
import { TagsHolder } from "./model"
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
    existingStack,
  } = holder

  const clientToken = uuid.v4()
  const templateLocation = templateS3Url || templateBody
  const templateKey = templateS3Url ? "TemplateURL" : "TemplateBody"
  const capabilities = stack.getCapabilities() || defaultCapabilities
  const localTerminationProtection = stack.isTerminationProtectionEnabled()

  switch (launchType) {
    case StackLaunchType.UPDATE:
      logger.info("Update stack")
      const updateWatch = watch.startChild("update-stack")
      const terminationProtectionUpdated =
        localTerminationProtection !==
        existingStack?.EnableTerminationProtection

      if (terminationProtectionUpdated) {
        logger.info(
          localTerminationProtection
            ? "Enable termination protection"
            : "Disable termination protection",
        )

        try {
          await cloudFormationClient.updateTerminationProtection(
            stack.getName(),
            localTerminationProtection,
          )
        } catch (e) {
          logger.error("Failed to update termination protection", e)
          return {
            stack,
            message: e.message,
            reason: "UPDATE_TERMINATION_PROTECTION_FAILED",
            status: CommandStatus.FAILED,
            events: [],
            success: false,
            watch: watch.stop(),
          }
        }
      }

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
          if (terminationProtectionUpdated) {
            logger.info("No updates to perform")
            const result = {
              stack,
              message: "Success",
              reason: "UPDATE_SUCCESS",
              status: CommandStatus.SUCCESS,
              events: [],
              success: true,
              watch: watch.stop(),
            }

            return executeAfterLaunchHooks({
              ...holder,
              result,
              clientToken: "",
            })
          } else {
            logger.info("No updates to perform")
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
    case StackLaunchType.RECREATE:
      logger.info("Create stack")
      const createWatch = watch.startChild("create-stack")

      try {
        await cloudFormationClient.createStack({
          Capabilities: capabilities,
          ClientRequestToken: clientToken,
          DisableRollback: false,
          EnableTerminationProtection: stack.isTerminationProtectionEnabled(),
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
