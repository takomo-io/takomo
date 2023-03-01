import { StageName } from "../../../../config-sets/config-set-model.js"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "../../../../config/targets-config.js"
import { DeploymentTargetsContext } from "../../../../context/targets-context.js"
import {
  ConfigSetExecutionGroup,
  ConfigSetExecutionPlan,
  ConfigSetExecutionTarget,
} from "../../../../takomo-execution-plans/index.js"
import { TkmLogger } from "../../../../utils/logging.js"
import {
  createConfigSetExecutionPlan,
  TargetsSelectionCriteria,
} from "./create-config-set-execution-plan.js"
import { getExecutionRoleArn } from "./get-execution-role-arn.js"
import { PlannedDeploymentTarget } from "./model.js"

export type ConfigSetExecutionPlanTargetsSelectionProps =
  TargetsSelectionCriteria

export interface CreateConfigSetExecutionPlanProps {
  readonly ctx: DeploymentTargetsContext
  readonly logger: TkmLogger
  readonly targetsSelectionCriteria: ConfigSetExecutionPlanTargetsSelectionProps
}

export const createExecutionPlan = async (
  props: CreateConfigSetExecutionPlanProps,
): Promise<ConfigSetExecutionPlan<PlannedDeploymentTarget>> => {
  const {
    ctx,
    targetsSelectionCriteria: { configSetName, commandPath },
  } = props

  const callerIdentity = await ctx.credentialManager.getCallerIdentity()

  const getConfigSetsWithStage = (
    target: DeploymentTargetConfig,
    stageName: StageName,
  ) => target.configSets.filter((cs) => cs.stage === stageName)

  const hasConfigSetsWithStage = (
    target: DeploymentTargetConfig,
    stageName: StageName,
  ) => getConfigSetsWithStage(target, stageName).length > 0

  const convertToExecutionTarget = (
    target: DeploymentTargetConfig,
    stageName: StageName,
    group: DeploymentGroupConfig,
  ): ConfigSetExecutionTarget<PlannedDeploymentTarget> => ({
    id: target.name,
    vars: target.vars,
    configSets: getConfigSetsWithStage(target, stageName)
      .map((cs) => cs.name)
      .filter((csName) => !configSetName || csName === configSetName)
      .map((csName) => ctx.getConfigSet(csName))
      .map((cs) => ({
        name: cs.name,
        commandPaths: commandPath ? [commandPath] : cs.commandPaths,
      })),
    data: {
      ...target,
      deploymentGroup: {
        name: group.name,
        path: group.path,
      },
      executionRoleArn: getExecutionRoleArn(callerIdentity, target),
    },
  })

  const executionGroupConverter = (
    group: DeploymentGroupConfig,
    stageName: StageName,
  ): ConfigSetExecutionGroup<PlannedDeploymentTarget> => ({
    id: group.path,
    targets: group.targets
      .filter((target) => hasConfigSetsWithStage(target, stageName))
      .map((target) => convertToExecutionTarget(target, stageName, group))
      .filter(({ configSets }) => configSets.length > 0),
  })

  return createConfigSetExecutionPlan({ ...props, executionGroupConverter })
}
