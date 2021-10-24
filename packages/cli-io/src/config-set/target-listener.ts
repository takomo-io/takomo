import {
  CreateTargetListenerProps,
  ExecutionGroup,
  TargetListener,
} from "@takomo/config-sets"
import { TkmLogger } from "@takomo/util"

export const createTargetListenerInternal = (
  groupsName: string,
  targetsName: string,
  logger: TkmLogger,
  props: CreateTargetListenerProps,
): TargetListener => {
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

  const onGroupBegin = async (group: ExecutionGroup<any>) => {
    logger.info(
      `Process ${groupsName} '${group.path}' with ${group.targets.length} ${targetsName}`,
    )
  }

  const onGroupComplete = async (group: ExecutionGroup<any>) => {
    logger.info(`Completed ${groupsName} '${group.path}'`)
  }

  return {
    onTargetBegin,
    onTargetComplete,
    onGroupBegin,
    onGroupComplete,
  }
}
