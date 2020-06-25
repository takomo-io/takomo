import { CommandStatus, ConfirmResult, StackPath } from "@takomo/core"
import { CommandContext, StackResult } from "@takomo/stacks-model"
import { StopWatch } from "@takomo/util"
import { StacksOperationInput, StacksOperationOutput } from "../../model"
import { IncompatibleIgnoreDependenciesOptionOnLaunchError } from "./errors"
import { launchStack } from "./launch"
import { DeployStacksIO } from "./model"

export const executeLaunchContext = async (
  ctx: CommandContext,
  input: StacksOperationInput,
  io: DeployStacksIO,
): Promise<StacksOperationOutput> => {
  const { ignoreDependencies } = input
  const stacksToLaunch = ctx.getStacksToProcess()
  if (ignoreDependencies && stacksToLaunch.length > 1) {
    throw new IncompatibleIgnoreDependenciesOptionOnLaunchError(stacksToLaunch)
  }

  const autoConfirm = ctx.getOptions().isAutoConfirmEnabled()
  const { watch } = input

  if (!autoConfirm && (await io.confirmDeploy(ctx)) !== ConfirmResult.YES) {
    return {
      success: false,
      results: [],
      status: CommandStatus.CANCELLED,
      message: "Cancelled",
      watch: watch.stop(),
    }
  }

  // When change review is enabled, the stacks are not executed parallel
  if (!autoConfirm) {
    const executions = new Map<StackPath, StackResult>()
    let cancelled = false
    let failed = false
    for (let i = 0; i < stacksToLaunch.length; i++) {
      const stack = stacksToLaunch[i]
      const dependencies = ignoreDependencies
        ? []
        : stack
            .getDependencies()
            .map((d) => Promise.resolve(executions.get(d)!))

      if (cancelled || failed) {
        executions.set(stack.getPath(), {
          status: CommandStatus.CANCELLED,
          watch: new StopWatch("launch").stop(),
          stack,
          success: false,
          events: [],
          message: "Cancelled",
          reason: "CANCELLED",
        })
        continue
      }

      const execution = await launchStack(watch, ctx, io, stack, dependencies)
      if (execution.status === CommandStatus.CANCELLED) {
        cancelled = true
      }
      if (execution.status === CommandStatus.FAILED) {
        failed = true
      }

      executions.set(stack.getPath(), execution)
    }

    const results = Array.from(executions.values())
    const success = results.find((r) => !r.success) === undefined
    return {
      success,
      results,
      status: success ? CommandStatus.SUCCESS : CommandStatus.FAILED,
      message: success ? "Success" : "Failed",
      watch: watch.stop(),
    }
  } else {
    const executions = stacksToLaunch.reduce((executions, stack) => {
      const dependencies = ignoreDependencies
        ? []
        : stack.getDependencies().map((d) => executions.get(d)!)

      const execution = launchStack(watch, ctx, io, stack, dependencies)
      executions.set(stack.getPath(), execution)

      return executions
    }, new Map<StackPath, Promise<StackResult>>())

    const results = await Promise.all(Array.from(executions.values()))
    const success = results.find((r) => !r.success) === undefined
    return {
      success,
      results,
      status: success ? CommandStatus.SUCCESS : CommandStatus.FAILED,
      message: success ? "Success" : "Failed",
      watch: watch.stop(),
    }
  }
}
