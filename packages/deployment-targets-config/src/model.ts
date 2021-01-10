import { AccountId } from "@takomo/aws-model"
import { ConfigSet, ConfigSetName } from "@takomo/config-sets"
import { CommandRole, Vars } from "@takomo/core"
import {
  DeploymentGroupName,
  DeploymentGroupPath,
  DeploymentStatus,
  DeploymentTargetName,
} from "@takomo/deployment-targets-model"

export interface DeploymentTargetConfig {
  readonly status: DeploymentStatus
  readonly name: DeploymentTargetName
  readonly description: string
  readonly vars: Vars
  readonly configSets: ReadonlyArray<ConfigSetName>
  readonly bootstrapConfigSets: ReadonlyArray<ConfigSetName>
  readonly deploymentRole?: CommandRole
  readonly bootstrapRole?: CommandRole
  readonly accountId?: AccountId
}

export interface DeploymentGroupConfig {
  readonly name: DeploymentGroupName
  readonly path: DeploymentGroupPath
  readonly description: string
  readonly targets: ReadonlyArray<DeploymentTargetConfig>
  readonly priority: number
  readonly status: DeploymentStatus
  readonly vars: Vars
  readonly configSets: ReadonlyArray<ConfigSetName>
  readonly bootstrapConfigSets: ReadonlyArray<ConfigSetName>
  readonly children: ReadonlyArray<DeploymentGroupConfig>
  readonly deploymentRole?: CommandRole
  readonly bootstrapRole?: CommandRole
}

export interface DeploymentConfig {
  readonly configSets: ReadonlyArray<ConfigSet>
  readonly vars: Vars
  readonly deploymentGroups: ReadonlyArray<DeploymentGroupConfig>
}
