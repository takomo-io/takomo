import {
  ConfigSetExecutionGroup,
  ConfigSetTargetListener,
  CreateConfigSetTargetListenerProps,
} from "@takomo/execution-plans"
import { TkmLogger } from "@takomo/util"

export const createTargetListenerInternal = (
  groupsName: string,
  targetsName: string,
  logger: TkmLogger,
  props: CreateConfigSetTargetListenerProps,
): ConfigSetTargetListener => {
  const { stageName, currentStageNumber, stageCount, targetCount } = props

  let targetsInProgress = 0
  let targetsCompleted = 0
  const stageInfo = `stage ${currentStageNumber}/${stageCount}: ${stageName}`

  const onTargetBegin = async () => {
    targetsInProgress++
  }

  const onTargetComplete = async () => {
    targetsInProgress--
    targetsCompleted++
    const waitingCount = targetCount - targetsInProgress - targetsCompleted
    const percentage = ((targetsCompleted / targetCount) * 100).toFixed(1)
    logger.info(
      `${stageInfo}, ${targetsName} waiting: ${waitingCount}, in progress: ${targetsInProgress}, completed: ${targetsCompleted}/${targetCount} (${percentage}%)`,
    )
  }

  const onGroupBegin = async (group: ConfigSetExecutionGroup<any>) => {
    logger.info(
      `Process ${groupsName} '${group.id}' with ${group.targets.length} ${targetsName}`,
    )
  }

  const onGroupComplete = async (group: ConfigSetExecutionGroup<any>) => {
    logger.info(`Completed ${groupsName} '${group.id}'`)
  }

  return {
    onTargetBegin,
    onTargetComplete,
    onGroupBegin,
    onGroupComplete,
  }
}
