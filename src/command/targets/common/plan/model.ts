import { AccountId, IamRoleArn } from "../../../../takomo-aws-model"
import { DeploymentTargetConfig } from "../../../../takomo-deployment-targets-config"
import {
  DeploymentGroupName,
  DeploymentGroupPath,
} from "../../../../takomo-deployment-targets-model"

interface PlannedDeploymentGroup {
  readonly name: DeploymentGroupName
  readonly path: DeploymentGroupPath
}

export interface PlannedDeploymentTarget extends DeploymentTargetConfig {
  readonly executionRoleArn?: IamRoleArn
  readonly accountId?: AccountId
  readonly deploymentGroup: PlannedDeploymentGroup
}
