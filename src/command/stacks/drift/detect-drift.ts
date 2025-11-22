import { InternalStacksContext } from "../../../context/stacks-context.js"
import { isNotObsolete } from "../../../takomo-stacks-model/util.js"
import { TkmLogger } from "../../../utils/logging.js"
import {
  isCustomStackPair,
  isStandardStackPair,
  loadCurrentStacks,
} from "../common/load-current-cf-stacks.js"
import { DetectDriftInput, DetectDriftOutput, StackDriftInfo } from "./model.js"

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

  const stackPairs = await loadCurrentStacks(
    logger,
    stacksWithinCommandPath,
    ctx,
  )

  const standardStacks = stackPairs.filter(isStandardStackPair)

  const stacks: ReadonlyArray<StackDriftInfo> = await Promise.all(
    standardStacks.map(async (pair) => {
      if (isCustomStackPair(pair)) {
        return { stack: pair.stack, type: "custom" }
      }

      const { stack, currentStack: current } = pair

      if (!current) {
        return { current, stack, type: "standard" }
      }

      const client = await stack.getCloudFormationClient()
      const id = await client.detectDrift(stack.name)
      const driftDetectionStatus = await client.waitDriftDetectionToComplete(id)
      return { stack, current, driftDetectionStatus, type: "standard" }
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
