import { IamRoleName, OrganizationAccount } from "@takomo/aws-model"
import {
  ConfigSetInstruction,
  ConfigSetStage,
  ConfigSetType,
} from "@takomo/config-sets"
import { OrganizationAccountConfig } from "@takomo/organization-config"
import { OrganizationalUnitPath } from "@takomo/organization-model"

export interface AccountsPlanAccount {
  readonly account: OrganizationAccount
  readonly config: OrganizationAccountConfig
}

export interface AccountsPlanOU {
  readonly path: OrganizationalUnitPath
  readonly accountAdminRoleName?: IamRoleName
  readonly accountBootstrapRoleName?: IamRoleName
  readonly accounts: ReadonlyArray<AccountsPlanAccount>
  readonly vars: any
  readonly configSets: ReadonlyArray<ConfigSetInstruction>
}

export interface AccountsPlanStage {
  readonly stage?: ConfigSetStage
  readonly organizationalUnits: ReadonlyArray<AccountsPlanOU>
}

export interface AccountsPlan {
  readonly stages: ReadonlyArray<AccountsPlanStage>
  readonly configSetType: ConfigSetType
}
