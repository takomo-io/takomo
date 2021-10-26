import { AccountId, IamRoleArn } from "@takomo/aws-model"
import { DeploymentTargetConfig } from "@takomo/deployment-targets-config"

export interface PlannedDeploymentTarget extends DeploymentTargetConfig {
  readonly executionRoleArn?: IamRoleArn
  readonly accountId?: AccountId
}
