import {
  HookExecutor,
  HookOperation,
  HooksExecutionOutput,
  HookStage,
  HookStatus,
  InternalStacksContext,
  StackOperationVariables,
} from "@takomo/stacks-model"
import { TkmLogger } from "@takomo/util"

/**
 * @hidden
 */
export const executeHooks = async (
  ctx: InternalStacksContext,
  variables: StackOperationVariables,
  hooks: ReadonlyArray<HookExecutor>,
  operation: HookOperation,
  stage: HookStage,
  logger: TkmLogger,
  status?: HookStatus,
): Promise<HooksExecutionOutput> => {
  logger.debug(
    `About to execute hooks (operation: ${operation}, stage: ${stage}, status: ${status})`,
  )

  const input = {
    ctx,
    variables,
    stage,
    operation,
    status,
  }

  const hooksToExecute = hooks.filter((h) => h.match(input))

  logger.debug(`Found ${hooksToExecute.length} matching hook(s)`)

  for (const hook of hooksToExecute) {
    logger.debug(
      `Execute hook (name: ${hook.config.name}, type: ${hook.config.type})`,
    )

    try {
      const output = await hook.execute(input)

      logger.debug(
        `Hook (name: ${hook.config.name}, type: ${hook.config.type}) executed with success: ${output.success}, message: ${output.message}`,
      )

      variables.hooks[hook.config.name] = output.value

      if (!output.success) {
        return {
          message: output.message || "Failed",
          success: false,
        }
      }
    } catch (e) {
      logger.error(
        `An error occurred while executing hook (name: ${hook.config.name}, type: ${hook.config.type})`,
        e,
      )
      return {
        message: e.message || "Error",
        success: false,
      }
    }
  }

  return {
    message: "Success",
    success: true,
  }
}
