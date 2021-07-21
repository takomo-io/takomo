import { AccountId, OrganizationAccount } from "@takomo/aws-model"
import {
  ConfigSetInstruction,
  ConfigSetOperationResult,
  ConfigSetStage,
  ConfigSetType,
} from "@takomo/config-sets"
import {
  CommandInput,
  CommandOutput,
  CommandOutputBase,
  ConfirmResult,
  IO,
} from "@takomo/core"
import { OrganizationAccountConfig } from "@takomo/organization-config"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"

export interface AccountsOperationInput extends CommandInput {
  readonly organizationalUnits: ReadonlyArray<string>
  readonly accountIds: ReadonlyArray<AccountId>
  readonly operation: DeploymentOperation
  readonly configSetType: ConfigSetType
  readonly concurrentAccounts: number
}

export interface AccountOperationResult extends CommandOutputBase {
  readonly accountId: AccountId
  readonly results: ReadonlyArray<ConfigSetOperationResult>
  readonly timer: Timer
}

export interface OrganizationalUnitAccountsOperationResult
  extends CommandOutputBase {
  readonly path: OrganizationalUnitPath
  readonly results: ReadonlyArray<AccountOperationResult>
  readonly stage?: ConfigSetStage
  readonly timer: Timer
}

export interface AccountsOperationOutput extends CommandOutput {
  readonly results?: ReadonlyArray<OrganizationalUnitAccountsOperationResult>
}

export interface AccountsListener {
  readonly onAccountBegin: () => Promise<void>
  readonly onAccountComplete: () => Promise<void>
}

export interface AccountsOperationIO extends IO<AccountsOperationOutput> {
  readonly createStackDeployIO: (accountId: AccountId) => DeployStacksIO
  readonly createStackUndeployIO: (accountId: AccountId) => UndeployStacksIO
  readonly confirmLaunch: (plan: AccountsLaunchPlan) => Promise<ConfirmResult>
  readonly createAccountsListener: (
    stageInfo: string,
    accountCount: number,
  ) => AccountsListener
}

export interface PlannedLaunchableAccount {
  readonly account: OrganizationAccount
  readonly config: OrganizationAccountConfig
}

export interface PlannedAccountDeploymentOrganizationalUnit {
  readonly path: string
  readonly accountAdminRoleName?: string
  readonly accountBootstrapRoleName?: string
  readonly accounts: ReadonlyArray<PlannedLaunchableAccount>
  readonly vars: any
  readonly configSets: ReadonlyArray<ConfigSetInstruction>
}

export interface AccountsLaunchStagePlan {
  readonly stage?: ConfigSetStage
  readonly organizationalUnits: ReadonlyArray<PlannedAccountDeploymentOrganizationalUnit>
}

export interface AccountsLaunchPlan {
  readonly hasChanges: boolean
  readonly stages: ReadonlyArray<AccountsLaunchStagePlan>
  readonly configSetType: ConfigSetType
}
