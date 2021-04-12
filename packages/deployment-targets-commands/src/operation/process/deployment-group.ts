import { resolveCommandOutputBase } from "@takomo/core"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "@takomo/deployment-targets-config"
import { OperationState } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import { IPolicy, Policy } from "cockatiel"
import {
  DeploymentGroupDeployResult,
  DeploymentTargetDeployResult,
  DeploymentTargetsListener,
  PlanHolder,
} from "../model"
import { processDeploymentTarget } from "./deployment-target"

type DeploymentTargetDeployOperation = () => Promise<
  DeploymentTargetDeployResult
>

const convertToOperation = (
  holder: PlanHolder,
  group: DeploymentGroupConfig,
  timer: Timer,
  state: OperationState,
  target: DeploymentTargetConfig,
  results: Array<DeploymentTargetDeployResult>,
  policy: IPolicy,
  listener: DeploymentTargetsListener,
): DeploymentTargetDeployOperation => () =>
  policy.execute(async () => {
    await listener.onTargetBegin()
    const result = await processDeploymentTarget(
      holder,
      group,
      target,
      timer.startChild(target.name),
      state,
    )
    results.push(result)
    await listener.onTargetComplete()
    return result
  })

/**
 * @hidden
 */
export const processDeploymentGroup = async (
  holder: PlanHolder,
  group: DeploymentGroupConfig,
  timer: Timer,
  state: OperationState,
): Promise<DeploymentGroupDeployResult> => {
  const {
    io,
    listener,
    input: { concurrentTargets },
  } = holder

  io.info(`Execute deployment group: ${group.path}`)
  const results = new Array<DeploymentTargetDeployResult>()

  const deploymentPolicy = Policy.bulkhead(concurrentTargets, 10000)

  const operations = group.targets.map((target) =>
    convertToOperation(
      holder,
      group,
      timer,
      state,
      target,
      results,
      deploymentPolicy,
      listener,
    ),
  )

  await Promise.all(operations.map((o) => o()))

  timer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    path: group.path,
    timer,
  }
}
