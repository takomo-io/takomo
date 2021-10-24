import { DeploymentTargetConfig } from "@takomo/deployment-targets-config"
import { DeploymentTargetNamePattern } from "@takomo/deployment-targets-model"
import { createDeploymentPlan } from "../common/plan"
import { confirmOperation } from "./confirm"
import { DeploymentTargetsOperationOutput, InitialHolder } from "./model"

type Matcher = (targetName: DeploymentTargetConfig) => boolean

export const createDeploymentTargetNamePatternMatcher = (
  pattern: DeploymentTargetNamePattern,
): Matcher => {
  const prefix = pattern.endsWith("%")
  const suffix = pattern.startsWith("%")
  if (prefix && suffix) {
    const part = pattern.slice(1, -1)
    return ({ name }) => name.includes(part)
  }
  if (prefix) {
    const part = pattern.slice(0, -1)
    return ({ name }) => name.startsWith(part)
  }
  if (suffix) {
    const part = pattern.slice(1)
    return ({ name }) => name.endsWith(part)
  }
  return ({ name }) => name === pattern
}

export const planDeployment = async (
  holder: InitialHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const { ctx, io, input, timer } = holder

  const plan = await createDeploymentPlan({
    ctx,
    logger: io,
    targetsSelectionCriteria: input,
  })

  if (plan.stages.length === 0) {
    timer.stop()
    io.info("No targets to deploy")
    return {
      timer,
      outputFormat: input.outputFormat,
      results: [],
      success: true,
      status: "SKIPPED",
      message: "No targets to deploy",
    }
  }

  return confirmOperation({
    ...holder,
    plan,
  })
}
