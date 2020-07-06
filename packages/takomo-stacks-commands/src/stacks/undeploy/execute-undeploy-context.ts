import {
  CommandStatus,
  resolveCommandOutputBase,
  StackPath,
} from "@takomo/core"
import { CommandContext, StackResult } from "@takomo/stacks-model"
import { StacksOperationInput, StacksOperationOutput } from "../../model"
import { deleteStack } from "./delete"
import { IncompatibleIgnoreDependenciesOptionOnDeleteError } from "./errors"
import { ConfirmUndeployAnswer, UndeployStacksIO } from "./model"

export const executeUndeployContext = async (
  ctx: CommandContext,
  input: StacksOperationInput,
  io: UndeployStacksIO,
): Promise<StacksOperationOutput> => {
  const autoConfirm = ctx.getOptions().isAutoConfirmEnabled()
  const stacks = ctx.getStacksToProcess()
  const { watch, ignoreDependencies } = input

  if (ignoreDependencies && stacks.length > 1) {
    throw new IncompatibleIgnoreDependenciesOptionOnDeleteError(stacks)
  }

  if (
    !autoConfirm &&
    (await io.confirmUndeploy(ctx)) !== ConfirmUndeployAnswer.CONTINUE
  ) {
    io.info("Undeploy cancelled")
    return {
      success: true,
      status: CommandStatus.CANCELLED,
      message: "Cancelled",
      results: [],
      watch: watch.stop(),
    }
  }

  io.debugObject(
    `Undeploy ${stacks.length} stack(s) in following order:`,
    stacks.map((s) => s.getPath()),
  )

  const executions = stacks.reduce((executions, stack) => {
    const dependants = ignoreDependencies
      ? []
      : stack.getDependants().map((d) => executions.get(d)!)

    const execution = deleteStack(watch, ctx, io, stack, dependants)
    executions.set(stack.getPath(), execution)

    return executions
  }, new Map<StackPath, Promise<StackResult>>())

  const results = await Promise.all(Array.from(executions.values()))

  return {
    ...resolveCommandOutputBase(results),
    results,
    watch: watch.stop(),
  }
}
