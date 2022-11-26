import {
  ConfigSetType,
  getConfigSetsByType,
  StageName,
} from "../../../../takomo-config-sets"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "../../../../takomo-deployment-targets-config"
import { DeploymentTargetsContext } from "../../../../takomo-deployment-targets-context"
import {
  ConfigSetExecutionGroup,
  ConfigSetExecutionPlan,
  ConfigSetExecutionTarget,
} from "../../../../takomo-execution-plans"
import { TkmLogger } from "../../../../utils/logging"
import {
  createConfigSetExecutionPlan,
  TargetsSelectionCriteria,
} from "./create-config-set-execution-plan"
import { getExecutionRoleArn } from "./get-execution-role-arn"
import { PlannedDeploymentTarget } from "./model"

export interface ConfigSetExecutionPlanTargetsSelectionProps
  extends TargetsSelectionCriteria {
  readonly configSetType: ConfigSetType
}

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
    targetsSelectionCriteria: { configSetType, configSetName, commandPath },
  } = props

  const callerIdentity = await ctx.credentialManager.getCallerIdentity()

  const getConfigSetsWithStage = (
    target: DeploymentTargetConfig,
    stageName: StageName,
  ) =>
    getConfigSetsByType(configSetType, target).filter(
      (cs) => cs.stage === stageName,
    )

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
      executionRoleArn: getExecutionRoleArn(
        configSetType,
        callerIdentity,
        target,
      ),
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
