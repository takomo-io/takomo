import { IPolicy, Policy } from "cockatiel"
import { InternalCredentialManager } from "../../../aws/common/credentials"
import { ConfigSetContext } from "../../../config-sets/config-set-model"
import {
  CommandOutput,
  OperationState,
  resolveCommandOutputBase,
} from "../../../takomo-core/command"
import { TkmLogger } from "../../../utils/logging"
import { Timer } from "../../../utils/timer"
import {
  ConfigSetExecutionGroup,
  ConfigSetExecutionTarget,
  ConfigSetGroupExecutionResult,
  ConfigSetTargetExecutionResult,
  ConfigSetTargetExecutor,
  ConfigSetTargetListener,
} from "../model"
import { executeTarget } from "./target"

type TargetExecution<R extends CommandOutput> = () => Promise<
  ConfigSetTargetExecutionResult<R>
>

interface ConvertToOperationProps<R extends CommandOutput, C> {
  readonly timer: Timer
  readonly policy: IPolicy
  readonly target: ConfigSetExecutionTarget<C>
  readonly state: OperationState
  readonly results: Array<ConfigSetTargetExecutionResult<R>>
  readonly targetListener: ConfigSetTargetListener
  readonly logger: TkmLogger
  readonly ctx: ConfigSetContext
  readonly executor: ConfigSetTargetExecutor<R, C>
  readonly defaultCredentialManager: InternalCredentialManager
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
      const result = await executeTarget<R, C>({
        target,
        state,
        executor,
        ctx,
        defaultCredentialManager,
        timer: timer.startChild(target.id),
        logger: logger.childLogger(target.id),
      })

      results.push(result)
      await targetListener.onTargetComplete()
      return result
    })

export interface ExecuteGroupProps<R extends CommandOutput, C> {
  readonly targetListener: ConfigSetTargetListener
  readonly group: ConfigSetExecutionGroup<C>
  readonly timer: Timer
  readonly state: OperationState
  readonly logger: TkmLogger
  readonly ctx: ConfigSetContext
  readonly executor: ConfigSetTargetExecutor<R, C>
  readonly concurrentTargets: number
  readonly defaultCredentialManager: InternalCredentialManager
}

export const executeGroup = async <R extends CommandOutput, C>({
  targetListener,
  group,
  timer,
  state,
  logger,
  executor,
  ctx,
  concurrentTargets,
  defaultCredentialManager,
}: ExecuteGroupProps<R, C>): Promise<ConfigSetGroupExecutionResult<R>> => {
  await targetListener.onGroupBegin(group)

  const policy = Policy.bulkhead(concurrentTargets, 10000)
  const results = new Array<ConfigSetTargetExecutionResult<R>>()

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

  await targetListener.onGroupComplete(group)

  return {
    ...resolveCommandOutputBase(results),
    groupId: group.id,
    results,
    timer: timer.stop(),
  }
}
