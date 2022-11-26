import {
  InternalStacksContext,
  isNotObsolete,
} from "../../../takomo-stacks-model"
import { TkmLogger } from "../../../utils/logging"
import { loadCurrentCfStacks } from "../common/load-current-cf-stacks"
import { DetectDriftInput, DetectDriftOutput } from "./model"

export const detectDrift = async (
  ctx: InternalStacksContext,
  input: DetectDriftInput,
  logger: TkmLogger,
): Promise<DetectDriftOutput> => {
  logger.info("Detecting drift, this might take a few minutes...")
  const { timer } = input

  const stacksWithinCommandPath = ctx.stacks
    .filter((stack) => stack.path.startsWith(input.commandPath))
    .filter(isNotObsolete)

  const stackPairs = await loadCurrentCfStacks(logger, stacksWithinCommandPath)

  const stacks = await Promise.all(
    stackPairs.map(async ({ stack, current }) => {
      if (!current) {
        return { current, stack }
      }

      const client = await stack.getCloudFormationClient()
      const id = await client.detectDrift(stack.name)
      const driftDetectionStatus = await client.waitDriftDetectionToComplete(id)
      return { stack, current, driftDetectionStatus }
    }),
  )

  const driftFound = stacks.some(
    (s) => s.driftDetectionStatus?.stackDriftStatus === "DRIFTED",
  )

  return {
    success: !driftFound,
    status: driftFound ? "FAILED" : "SUCCESS",
    message: driftFound ? "Failed" : "Success",
    outputFormat: input.outputFormat,
    timer: timer.stop(),
    stacks,
  }
}
