import { AccountId, IamRoleArn } from "../../../../aws/common/model.js"
import { DeploymentTargetConfig } from "../../../../config/targets-config.js"
import {
  DeploymentGroupName,
  DeploymentGroupPath,
} from "../../../../targets/targets-model.js"

interface PlannedDeploymentGroup {
  readonly name: DeploymentGroupName
  readonly path: DeploymentGroupPath
}

export interface PlannedDeploymentTarget extends DeploymentTargetConfig {
  readonly executionRoleArn?: IamRoleArn
  readonly accountId?: AccountId
  readonly deploymentGroup: PlannedDeploymentGroup
}
