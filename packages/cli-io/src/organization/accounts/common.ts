import { CreateTargetListenerProps, TargetListener } from "@takomo/config-sets"
import { TkmLogger } from "@takomo/util"

export const createTargetListenerInternal = (
  logger: TkmLogger,
  props: CreateTargetListenerProps,
): TargetListener => {
  const { stageName, currentStageNumber, stageCount, targetCount } = props

  let accountsInProgress = 0
  let accountsCompleted = 0
  const stageInfo = `stage ${currentStageNumber}/${stageCount}: ${stageName}`

  const onTargetBegin = async () => {
    accountsInProgress++
  }

  const onTargetComplete = async () => {
    accountsInProgress--
    accountsCompleted++
    const waitingCount = targetCount - accountsInProgress - accountsCompleted
    const percentage = ((accountsCompleted / targetCount) * 100).toFixed(1)
    logger.info(
      `${stageInfo}, accounts waiting: ${waitingCount}, in progress: ${accountsInProgress}, completed: ${accountsCompleted}/${targetCount} (${percentage}%)`,
    )
  }

  return {
    onTargetBegin,
    onTargetComplete,
  }
}
