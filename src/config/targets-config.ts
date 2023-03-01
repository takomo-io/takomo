import { AccountId, IamRoleName } from "../aws/common/model.js"
import { Vars } from "../common/model.js"
import {
  ConfigSet,
  ConfigSetInstruction,
  ConfigSetInstructionsHolder,
} from "../config-sets/config-set-model.js"
import { CommandRole } from "../takomo-core/command.js"
import {
  DeploymentGroupName,
  DeploymentGroupPath,
  DeploymentStatus,
  DeploymentTargetName,
  Label,
} from "../targets/targets-model.js"

export interface SchemaConfig {
  readonly name: string
  readonly [key: string]: unknown
}

export interface DeploymentTargetConfig extends ConfigSetInstructionsHolder {
  readonly status: DeploymentStatus
  readonly name: DeploymentTargetName
  readonly description?: string
  readonly vars: Vars
  readonly labels: ReadonlyArray<Label>
  readonly deploymentRole?: CommandRole
  readonly deploymentRoleName?: IamRoleName
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
  readonly configSets: ReadonlyArray<ConfigSetInstruction>
  readonly labels: ReadonlyArray<Label>
  readonly children: ReadonlyArray<DeploymentGroupConfig>
  readonly deploymentRole?: CommandRole
  readonly deploymentRoleName?: IamRoleName
}

export interface DeploymentConfig {
  readonly targetsSchema: ReadonlyArray<SchemaConfig>
  readonly configSets: ReadonlyArray<ConfigSet>
  readonly vars: Vars
  readonly deploymentGroups: ReadonlyArray<DeploymentGroupConfig>
  readonly deploymentRole?: CommandRole
  readonly deploymentRoleName?: IamRoleName
}
