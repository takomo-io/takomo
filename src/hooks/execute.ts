import { StackOperationVariables } from "../command/command-model"
import { InternalStacksContext } from "../context/stacks-context"
import { Stack } from "../stacks/stack"
import { TkmLogger } from "../utils/logging"
import {
  HookOperation,
  HooksExecutionOutput,
  HookStage,
  HookStatus,
} from "./hook"
import { HookExecutor } from "./hook-executor"

interface ExecuteHooksProps {
  readonly ctx: InternalStacksContext
  readonly stack: Stack
  readonly variables: StackOperationVariables
  readonly hooks: ReadonlyArray<HookExecutor>
  readonly operation: HookOperation
  readonly stage: HookStage
  readonly logger: TkmLogger
  readonly status?: HookStatus
}

export const executeHooks = async ({
  ctx,
  stack,
  variables,
  hooks,
  operation,
  stage,
  logger,
  status,
}: ExecuteHooksProps): Promise<HooksExecutionOutput> => {
  logger.debug(
    `About to execute hooks (operation: ${operation}, stage: ${stage}, status: ${status})`,
  )

  const input = {
    ctx,
    stack,
    variables,
    stage,
    operation,
    status,
    logger,
  }

  const hooksToExecute = hooks.filter((h) => h.match(input))

  logger.debug(`Found ${hooksToExecute.length} matching hook(s)`)

  for (const hook of hooksToExecute) {
    logger.debug(
      `Execute hook (name: ${hook.config.name}, type: ${hook.config.type})`,
    )

    try {
      const output = await hook.execute({
        ...input,
        logger: logger.childLogger(`hook:${stage}:${hook.config.name}`),
      })

      logger.debug(
        `Hook (name: ${hook.config.name}, type: ${hook.config.type}) executed with success: ${output.success}, skip: ${output.skip} message: ${output.message}`,
      )

      variables.hooks[hook.config.name] = output.value

      if (!output.success) {
        return {
          message: output.message ?? "Failed",
          result: "abort",
          error: output.error,
        }
      }

      if (output.skip === true) {
        return {
          message: output.message ?? "Skip",
          result: "skip",
        }
      }
    } catch (error: any) {
      logger.error(
        `An error occurred while executing hook (name: ${hook.config.name}, type: ${hook.config.type})`,
        error,
      )
      return {
        error,
        result: "abort",
        message: error.message ?? "Error",
      }
    }
  }

  return {
    message: "Success",
    result: "continue",
  }
}
