import { resolveCommandOutputBase } from "@takomo/core"
import {
  InternalStacksContext,
  StackPath,
  StackResult,
} from "@takomo/stacks-model"
import { StacksOperationInput, StacksOperationOutput } from "../../model"
import { deleteStack } from "./delete"
import { IncompatibleIgnoreDependenciesOptionOnDeleteError } from "./errors"
import { UndeployStacksIO } from "./model"
import { StacksUndeployPlan } from "./plan"

/**
 * @hidden
 */
export const executeUndeployContext = async (
  ctx: InternalStacksContext,
  input: StacksOperationInput,
  io: UndeployStacksIO,
  plan: StacksUndeployPlan,
): Promise<StacksOperationOutput> => {
  const autoConfirm = ctx.autoConfirmEnabled
  const { operations } = plan
  const { timer, ignoreDependencies } = input

  // TODO: Move to plan and then validate
  if (ignoreDependencies && operations.length > 1) {
    throw new IncompatibleIgnoreDependenciesOptionOnDeleteError(
      operations.map((o) => o.stack),
    )
  }

  if (!autoConfirm && (await io.confirmUndeploy(plan)) !== "CONTINUE") {
    io.info("Undeploy cancelled")
    timer.stop()
    return {
      success: true,
      status: "CANCELLED",
      message: "Cancelled",
      results: [],
      timer,
    }
  }

  io.debugObject(
    `Undeploy ${operations.length} stack(s) in following order:`,
    operations.map((s) => s.stack.path),
  )

  const executions = operations.reduce((executions, operation) => {
    const dependents = ignoreDependencies
      ? []
      : operation.stack.dependents.map((d) => executions.get(d)!)

    const execution = deleteStack(timer, ctx, io, operation, dependents)
    executions.set(operation.stack.path, execution)

    return executions
  }, new Map<StackPath, Promise<StackResult>>())

  const results = await Promise.all(Array.from(executions.values()))

  timer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    timer,
  }
}
