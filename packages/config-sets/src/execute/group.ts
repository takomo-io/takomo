import { CredentialManager } from "@takomo/aws-clients"
import {
  CommandOutput,
  OperationState,
  resolveCommandOutputBase,
} from "@takomo/core"
import { Timer, TkmLogger } from "@takomo/util"
import { IPolicy, Policy } from "cockatiel"
import {
  ConfigSetContext,
  ExecutionGroup,
  ExecutionTarget,
  GroupExecutionResult,
  TargetExecutionResult,
  TargetExecutor,
  TargetListener,
} from "../model"
import { executeAccount } from "./target"

type TargetExecution<R extends CommandOutput> = () => Promise<
  TargetExecutionResult<R>
>

interface ConvertToOperationProps<R extends CommandOutput, C> {
  readonly timer: Timer
  readonly policy: IPolicy
  readonly target: ExecutionTarget<C>
  readonly state: OperationState
  readonly results: Array<TargetExecutionResult<R>>
  readonly targetListener: TargetListener
  readonly logger: TkmLogger
  readonly ctx: ConfigSetContext
  readonly executor: TargetExecutor<R, C>
  readonly defaultCredentialManager: CredentialManager
}

const convertToOperation =
  <R extends CommandOutput, C>({
    logger,
    timer,
    policy,
    target,
    state,
    results,
    targetListener,
    ctx,
    executor,
    defaultCredentialManager,
  }: ConvertToOperationProps<R, C>): TargetExecution<R> =>
  () =>
    policy.execute(async () => {
      await targetListener.onTargetBegin()
      const result = await executeAccount<R, C>({
        target,
        state,
        executor,
        ctx,
        timer: timer.startChild("TODO"),
        logger,
        defaultCredentialManager,
      })

      results.push(result)
      await targetListener.onTargetComplete()
      return result
    })

export interface ExecuteGroupProps<R extends CommandOutput, C> {
  readonly targetListener: TargetListener
  readonly group: ExecutionGroup<C>
  readonly timer: Timer
  readonly state: OperationState
  readonly logger: TkmLogger
  readonly ctx: ConfigSetContext
  readonly executor: TargetExecutor<R, C>
  readonly concurrentAccounts: number
  readonly defaultCredentialManager: CredentialManager
}

export const executeGroup = async <R extends CommandOutput, C>({
  targetListener,
  group,
  timer,
  state,
  logger,
  executor,
  ctx,
  concurrentAccounts,
  defaultCredentialManager,
}: ExecuteGroupProps<R, C>): Promise<GroupExecutionResult<R>> => {
  logger.info(
    `Process organizational unit '${group.path}' with ${group.targets.length} account(s)`,
  )

  const policy = Policy.bulkhead(concurrentAccounts, 10000)
  const results = new Array<TargetExecutionResult<R>>()

  const operations = group.targets.map((target) =>
    convertToOperation<R, C>({
      timer,
      policy,
      target,
      results,
      state,
      targetListener,
      executor,
      ctx,
      logger,
      defaultCredentialManager,
    }),
  )

  await Promise.all(operations.map((o) => o()))

  timer.stop()
  return {
    ...resolveCommandOutputBase(results),
    groupId: group.path,
    results,
    timer,
  }
}
