import { bulkhead } from "cockatiel"
import { InternalStacksContext } from "../../../context/stacks-context.js"
import { StackPath } from "../../../stacks/stack.js"
import {
  OutputFormat,
  resolveCommandOutputBase,
} from "../../../takomo-core/command.js"
import { StacksConfigRepository } from "../../../takomo-stacks-context/model.js"
import { Timer } from "../../../utils/timer.js"
import { StackResult } from "../../command-model.js"
import { StacksOperationListener } from "../common/model.js"
import { StacksDeployOperationInput, StacksOperationOutput } from "../model.js"
import { deployStack } from "./deploy-stack.js"
import { IncompatibleIgnoreDependenciesOptionOnLaunchError } from "./errors.js"
import { ConfirmDeployAnswer, DeployStacksIO, DeployState } from "./model.js"
import { StackDeployOperation, StacksDeployPlan } from "./plan.js"

const confirmDeploy = async (
  autoConfirm: boolean,
  plan: StacksDeployPlan,
  io: DeployStacksIO,
): Promise<ConfirmDeployAnswer> => {
  if (autoConfirm) {
    return "CONTINUE_NO_REVIEW"
  }

  return io.confirmDeploy(plan)
}

const executeStacksInParallel = async (
  ctx: InternalStacksContext,
  io: DeployStacksIO,
  state: DeployState,
  timer: Timer,
  operations: ReadonlyArray<StackDeployOperation>,
  ignoreDependencies: boolean,
  map: Map<StackPath, Promise<StackResult>>,
  configRepository: StacksConfigRepository,
  outputFormat: OutputFormat,
  stacksOperationListener: StacksOperationListener,
  expectNoChanges: boolean,
  emit: boolean,
  skipHooks: boolean,
  skipParameters: boolean,
  outDir?: string,
): Promise<StacksOperationOutput> => {
  const bh = bulkhead(ctx.concurrentStacks, 1000)

  const executions = operations.reduce((executions, operation) => {
    const { stack, type, currentStack } = operation
    const dependencies = ignoreDependencies
      ? []
      : stack.dependencies.map((d) => {
          const dependency = executions.get(d)
          if (!dependency) {
            throw new Error(
              `Dependency '${d}' in stack ${stack.path} does not exists`,
            )
          }

          return dependency
        })

    const execution = bh.execute(() =>
      deployStack(
        operation,
        timer,
        ctx,
        io,
        state,
        dependencies,
        configRepository,
        stacksOperationListener,
        expectNoChanges,
        emit,
        skipHooks,
        skipParameters,
        outDir,
      ),
    )

    executions.set(stack.path, execution)
    return executions
  }, map)

  const results = await Promise.all(Array.from(executions.values()))

  return {
    ...resolveCommandOutputBase(results),
    outputFormat,
    results,
    timer: timer.stop(),
  }
}

export const executeDeployContext = async (
  ctx: InternalStacksContext,
  input: StacksDeployOperationInput,
  io: DeployStacksIO,
  plan: StacksDeployPlan,
  configRepository: StacksConfigRepository,
): Promise<StacksOperationOutput> => {
  const {
    ignoreDependencies,
    expectNoChanges,
    timer,
    emit,
    outDir,
    skipHooks,
    skipParameters,
  } = input
  const { operations } = plan

  io.debugObject("Deploy stacks in the following order:", () =>
    plan.operations.map((o) => o.stack.path),
  )

  if (ignoreDependencies && operations.length > 1) {
    throw new IncompatibleIgnoreDependenciesOptionOnLaunchError(
      operations.map((o) => o.stack),
    )
  }

  const autoConfirm = ctx.autoConfirmEnabled
  const state = { cancelled: false, autoConfirm }
  const confirmAnswer = await confirmDeploy(autoConfirm, plan, io)

  if (confirmAnswer === "CANCEL") {
    return {
      outputFormat: input.outputFormat,
      success: false,
      results: [],
      status: "CANCELLED",
      message: "Cancelled",
      timer: timer.stop(),
    }
  }

  if (confirmAnswer === "CONTINUE_NO_REVIEW") {
    state.autoConfirm = true
  }

  const deployStacksListener = io.createStacksOperationListener(
    plan.operations.length,
  )

  if (state.autoConfirm) {
    return executeStacksInParallel(
      ctx,
      io,
      state,
      timer,
      operations,
      ignoreDependencies,
      new Map(),
      configRepository,
      input.outputFormat,
      deployStacksListener,
      expectNoChanges,
      emit,
      skipHooks,
      skipParameters,
      outDir,
    )
  }

  const executions = new Map<StackPath, StackResult>()
  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i]
    const stack = operation.stack
    const dependencies = ignoreDependencies
      ? []
      : stack.dependencies.map((d) => Promise.resolve(executions.get(d)!))

    if (state.cancelled) {
      executions.set(stack.path, {
        status: "CANCELLED",
        timer: timer.startChild("deploy").stop(),
        stack,
        success: false,
        events: [],
        message: "Cancelled",
        operationType: operation.type,
        stackExistedBeforeOperation: operation.currentStack !== undefined,
      })
      continue
    }

    const execution = await deployStack(
      operation,
      timer,
      ctx,
      io,
      state,
      dependencies,
      configRepository,
      deployStacksListener,
      expectNoChanges,
      emit,
      skipHooks,
      skipParameters,
      outDir,
    )

    if (execution.status === "CANCELLED" || execution.status === "FAILED") {
      state.cancelled = true
    }

    executions.set(stack.path, execution)

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
        timer,
        operations.slice(i + 1),
        ignoreDependencies,
        promisedExecutions,
        configRepository,
        input.outputFormat,
        deployStacksListener,
        expectNoChanges,
        emit,
        skipHooks,
        skipParameters,
        outDir,
      )
    }
  }

  const results = Array.from(executions.values())

  return {
    ...resolveCommandOutputBase(results),
    outputFormat: input.outputFormat,
    results,
    timer: timer.stop(),
  }
}
