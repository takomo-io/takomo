import {
  ConfigSetName,
  StageName,
} from "../../../../config-sets/config-set-model"
import { DeploymentGroupConfig } from "../../../../config/targets-config"
import { DeploymentTargetsContext } from "../../../../context/targets-context"
import {
  ConfigSetExecutionGroup,
  ConfigSetExecutionPlan,
  ConfigSetExecutionStage,
} from "../../../../takomo-execution-plans"
import {
  DeploymentGroupPath,
  DeploymentTargetNamePattern,
  Label,
} from "../../../../targets/targets-model"
import { TkmLogger } from "../../../../utils/logging"
import { CommandPath } from "../../../command-model"
import { PlannedDeploymentTarget } from "./model"
import { selectDeploymentGroups } from "./select-deployment-groups"

export type ExecutionGroupConverter = (
  group: DeploymentGroupConfig,
  stageName: StageName,
) => ConfigSetExecutionGroup<PlannedDeploymentTarget>

export interface TargetsSelectionCriteria {
  readonly groups: ReadonlyArray<DeploymentGroupPath>
  readonly targets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly excludeTargets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly labels: ReadonlyArray<Label>
  readonly excludeLabels: ReadonlyArray<Label>
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}

export interface CreateExecutionPlanProps {
  readonly ctx: DeploymentTargetsContext
  readonly logger: TkmLogger
  readonly targetsSelectionCriteria: TargetsSelectionCriteria
  readonly executionGroupConverter: ExecutionGroupConverter
}

export const createConfigSetExecutionPlan = ({
  ctx,
  targetsSelectionCriteria,
  executionGroupConverter,
}: CreateExecutionPlanProps): ConfigSetExecutionPlan<PlannedDeploymentTarget> => {
  const selectedGroups = selectDeploymentGroups(ctx, targetsSelectionCriteria)

  const createStage = (
    stageName: StageName,
  ): ConfigSetExecutionStage<PlannedDeploymentTarget> => ({
    stageName,
    groups: selectedGroups
      .map((group) => executionGroupConverter(group, stageName))
      .filter(({ targets }) => targets.length > 0),
  })

  const stages = ctx
    .getStages()
    .map(createStage)
    .filter(({ groups }) => groups.length > 0)

  return {
    stages,
  }
}
