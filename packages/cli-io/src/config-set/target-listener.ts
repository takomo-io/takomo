import { CreateTargetListenerProps, TargetListener } from "@takomo/config-sets"
import { TkmLogger } from "@takomo/util"

export const createTargetListenerInternal = (
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

  return {
    onTargetBegin,
    onTargetComplete,
  }
}
