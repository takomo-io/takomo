import {
  ConfigSetExecutionPlan,
  ConfigSetType,
  ExecutionGroup,
  ExecutionTarget,
  getConfigSetsByType,
  StageName,
} from "@takomo/config-sets"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "@takomo/deployment-targets-config"
import { DeploymentTargetsContext } from "@takomo/deployment-targets-context"
import { TkmLogger } from "@takomo/util"
import {
  createExecutionPlan,
  TargetsSelectionCriteria,
} from "./create-execution-plan"
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

export const createConfigSetExecutionPlan = async (
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
  ): ExecutionTarget<PlannedDeploymentTarget> => ({
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
  ): ExecutionGroup<PlannedDeploymentTarget> => ({
    path: group.path,
    targets: group.targets
      .filter((target) => hasConfigSetsWithStage(target, stageName))
      .map((target) => convertToExecutionTarget(target, stageName))
      .filter(({ configSets }) => configSets.length > 0),
  })

  const plan = createExecutionPlan({ ...props, executionGroupConverter })

  return {
    ...plan,
    configSetType,
  }
}
