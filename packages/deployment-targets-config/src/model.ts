import { AccountId, IamRoleName } from "@takomo/aws-model"
import { ConfigSet, ConfigSetName } from "@takomo/config-sets"
import { CommandRole, Vars } from "@takomo/core"
import {
  DeploymentGroupName,
  DeploymentGroupPath,
  DeploymentStatus,
  DeploymentTargetName,
  Label,
} from "@takomo/deployment-targets-model"

export interface SchemaConfig {
  readonly name: string
  readonly [key: string]: unknown
}

export interface DeploymentTargetConfig {
  readonly status: DeploymentStatus
  readonly name: DeploymentTargetName
  readonly description?: string
  readonly vars: Vars
  readonly configSets: ReadonlyArray<ConfigSetName>
  readonly bootstrapConfigSets: ReadonlyArray<ConfigSetName>
  readonly labels: ReadonlyArray<Label>
  readonly deploymentRole?: CommandRole
  readonly deploymentRoleName?: IamRoleName
  readonly bootstrapRole?: CommandRole
  readonly bootstrapRoleName?: IamRoleName
  readonly accountId?: AccountId
}

export interface DeploymentGroupConfig {
  readonly name: DeploymentGroupName
  readonly path: DeploymentGroupPath
  readonly description?: string
  readonly targets: ReadonlyArray<DeploymentTargetConfig>
  readonly priority: number
  readonly status: DeploymentStatus
  readonly vars: Vars
  readonly targetsSchema: ReadonlyArray<SchemaConfig>
  readonly configSets: ReadonlyArray<ConfigSetName>
  readonly bootstrapConfigSets: ReadonlyArray<ConfigSetName>
  readonly labels: ReadonlyArray<Label>
  readonly children: ReadonlyArray<DeploymentGroupConfig>
  readonly deploymentRole?: CommandRole
  readonly deploymentRoleName?: IamRoleName
  readonly bootstrapRole?: CommandRole
  readonly bootstrapRoleName?: IamRoleName
}

export interface DeploymentConfig {
  readonly targetsSchema: ReadonlyArray<SchemaConfig>
  readonly configSets: ReadonlyArray<ConfigSet>
  readonly vars: Vars
  readonly deploymentGroups: ReadonlyArray<DeploymentGroupConfig>
}
