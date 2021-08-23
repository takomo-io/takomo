import { InternalStacksContext } from "@takomo/stacks-model"
import { TkmLogger } from "@takomo/util"
import { loadCurrentCfStacks } from "../common/load-current-cf-stacks"
import { DetectDriftInput, DetectDriftOutput } from "./model"

/**
 * @hidden
 */
export const detectDrift = async (
  ctx: InternalStacksContext,
  input: DetectDriftInput,
  logger: TkmLogger,
): Promise<DetectDriftOutput> => {
  logger.info("Detecting drift, this might take a few minutes...")
  const { timer } = input

  const stacksWithinCommandPath = ctx.stacks.filter((stack) =>
    stack.path.startsWith(input.commandPath),
  )

  const stackPairs = await loadCurrentCfStacks(logger, stacksWithinCommandPath)

  const stacks = await Promise.all(
    stackPairs.map(async ({ stack, current }) => {
      if (!current) {
        return { current, stack }
      }

      const client = stack.getCloudFormationClient()
      const id = await client.detectDrift(stack.name)
      const driftDetectionStatus = await client.waitDriftDetectionToComplete(id)
      return { stack, current, driftDetectionStatus }
    }),
  )

  timer.stop()

  const driftFound = stacks.some(
    (s) => s.driftDetectionStatus?.stackDriftStatus === "DRIFTED",
  )

  return {
    success: !driftFound,
    status: driftFound ? "FAILED" : "SUCCESS",
    message: driftFound ? "Failed" : "Success",
    outputFormat: input.outputFormat,
    timer,
    stacks,
  }
}
