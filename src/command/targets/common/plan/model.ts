import { AccountId, IamRoleArn } from "../../../../aws/common/model"
import { DeploymentTargetConfig } from "../../../../config/targets-config"
import {
  DeploymentGroupName,
  DeploymentGroupPath,
} from "../../../../targets/targets-model"

interface PlannedDeploymentGroup {
  readonly name: DeploymentGroupName
  readonly path: DeploymentGroupPath
}

export interface PlannedDeploymentTarget extends DeploymentTargetConfig {
  readonly executionRoleArn?: IamRoleArn
  readonly accountId?: AccountId
  readonly deploymentGroup: PlannedDeploymentGroup
}
