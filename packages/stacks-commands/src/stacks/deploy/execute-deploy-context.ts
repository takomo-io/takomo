import {
  CommandStatus,
  resolveCommandOutputBase,
  StackPath,
} from "@takomo/core"
import { CommandContext, Stack, StackResult } from "@takomo/stacks-model"
import { StopWatch } from "@takomo/util"
import { StacksOperationInput, StacksOperationOutput } from "../../model"
import { cleanStacksWithInvalidStatus } from "./clean-stacks-with-invalid-status"
import { IncompatibleIgnoreDependenciesOptionOnLaunchError } from "./errors"
import { deployStack } from "./launch"
import { ConfirmDeployAnswer, DeployStacksIO, DeployState } from "./model"

const confirmDeploy = async (
  autoConfirm: boolean,
  ctx: CommandContext,
  io: DeployStacksIO,
): Promise<ConfirmDeployAnswer> => {
  if (autoConfirm) {
    return ConfirmDeployAnswer.CONTINUE_NO_REVIEW
  }

  return io.confirmDeploy(ctx)
}

const executeStacksInParallel = async (
  ctx: CommandContext,
  io: DeployStacksIO,
  state: DeployState,
  watch: StopWatch,
  stacksToDeploy: Stack[],
  ignoreDependencies: boolean,
  map: Map<StackPath, Promise<StackResult>>,
): Promise<StacksOperationOutput> => {
  const executions = stacksToDeploy.reduce((executions, stack) => {
    const dependencies = ignoreDependencies
      ? []
      : stack.getDependencies().map((d) => {
          const dependency = executions.get(d)
          if (!dependency) {
            io.error(
              `Dependency '${d}' in stack ${stack.getPath()} does not exists`,
            )
          }

          // TODO: Throw an error if dependency doesn't exists
          return dependency!
        })

    const execution = deployStack(watch, ctx, io, state, stack, dependencies)
    executions.set(stack.getPath(), execution)

    return executions
  }, map)

  const results = await Promise.all(Array.from(executions.values()))
  return {
    ...resolveCommandOutputBase(results),
    results,
    watch: watch.stop(),
  }
}

export const executeDeployContext = async (
  ctx: CommandContext,
  input: StacksOperationInput,
  io: DeployStacksIO,
): Promise<StacksOperationOutput> => {
  const { ignoreDependencies } = input
  const stacksToDeploy = ctx.getStacksToProcess()

  io.debugObject(
    "Deploy stacks in the following order:",
    stacksToDeploy.map((s) => s.getPath()),
  )

  if (ignoreDependencies && stacksToDeploy.length > 1) {
    throw new IncompatibleIgnoreDependenciesOptionOnLaunchError(stacksToDeploy)
  }

  const autoConfirm = ctx.getOptions().isAutoConfirmEnabled()
  const { watch } = input

  const state = { cancelled: false, autoConfirm }
  const confirmAnswer = await confirmDeploy(autoConfirm, ctx, io)

  if (confirmAnswer === ConfirmDeployAnswer.CANCEL) {
    return {
      success: false,
      results: [],
      status: CommandStatus.CANCELLED,
      message: "Cancelled",
      watch: watch.stop(),
    }
  }

  if (confirmAnswer === ConfirmDeployAnswer.CONTINUE_NO_REVIEW) {
    state.autoConfirm = true
  }

  await cleanStacksWithInvalidStatus(ctx, io)

  if (state.autoConfirm) {
    return executeStacksInParallel(
      ctx,
      io,
      state,
      watch,
      stacksToDeploy,
      ignoreDependencies,
      new Map(),
    )
  }

  const executions = new Map<StackPath, StackResult>()
  for (let i = 0; i < stacksToDeploy.length; i++) {
    const stack = stacksToDeploy[i]
    const dependencies = ignoreDependencies
      ? []
      : stack.getDependencies().map((d) => Promise.resolve(executions.get(d)!))

    if (state.cancelled) {
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

    const execution = await deployStack(
      watch,
      ctx,
      io,
      state,
      stack,
      dependencies,
    )
    if (
      execution.status === CommandStatus.CANCELLED ||
      execution.status === CommandStatus.FAILED
    ) {
      state.cancelled = true
    }

    executions.set(stack.getPath(), execution)

    if (state.autoConfirm) {
      const promisedExecutions = new Map(
        Array.from(executions.entries()).map(([stackPath, res]) => [
          stackPath,
          Promise.resolve(res),
        ]),
      )

      return executeStacksInParallel(
        ctx,
        io,
        state,
        watch,
        stacksToDeploy.slice(i + 1),
        ignoreDependencies,
        promisedExecutions,
      )
    }
  }

  const results = Array.from(executions.values())

  return {
    ...resolveCommandOutputBase(results),
    results,
    watch: watch.stop(),
  }
}
