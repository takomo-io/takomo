import { OutputFormat, resolveCommandOutputBase } from "@takomo/core"
import { StacksConfigRepository } from "@takomo/stacks-context"
import {
  InternalStacksContext,
  StackPath,
  StackResult,
} from "@takomo/stacks-model"
import { createTimer, Timer } from "@takomo/util"
import { Policy } from "cockatiel"
import { StacksOperationInput, StacksOperationOutput } from "../../model"
import { StacksOperationListener } from "../common/model"
import { deployStack } from "./deploy-stack"
import { IncompatibleIgnoreDependenciesOptionOnLaunchError } from "./errors"
import { ConfirmDeployAnswer, DeployStacksIO, DeployState } from "./model"
import { StackDeployOperation, StacksDeployPlan } from "./plan"

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

/**
 * @hidden
 */
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
): Promise<StacksOperationOutput> => {
  const bulkhead = Policy.bulkhead(ctx.concurrentStacks, 1000)

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

    const execution = bulkhead.execute(() =>
      deployStack(
        timer,
        ctx,
        io,
        state,
        stack,
        dependencies,
        type,
        configRepository,
        stacksOperationListener,
        currentStack,
      ),
    )

    executions.set(stack.path, execution)
    return executions
  }, map)

  const results = await Promise.all(Array.from(executions.values()))
  timer.stop()
  return {
    ...resolveCommandOutputBase(results),
    outputFormat,
    results,
    timer,
  }
}

/**
 * @hidden
 */
export const executeDeployContext = async (
  ctx: InternalStacksContext,
  input: StacksOperationInput,
  io: DeployStacksIO,
  plan: StacksDeployPlan,
  configRepository: StacksConfigRepository,
): Promise<StacksOperationOutput> => {
  const { ignoreDependencies, timer } = input
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
    timer.stop()
    return {
      outputFormat: input.outputFormat,
      success: false,
      results: [],
      status: "CANCELLED",
      message: "Cancelled",
      timer,
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
      const t = createTimer("deploy")
      t.stop()
      executions.set(stack.path, {
        status: "CANCELLED",
        timer: t,
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
      timer,
      ctx,
      io,
      state,
      stack,
      dependencies,
      operation.type,
      configRepository,
      deployStacksListener,
      operation.currentStack,
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
      )
    }
  }

  const results = Array.from(executions.values())

  timer.stop()

  return {
    ...resolveCommandOutputBase(results),
    outputFormat: input.outputFormat,
    results,
    timer,
  }
}
