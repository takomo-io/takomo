import { AccountId } from "@takomo/aws-model"
import {
  ConfigSetName,
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
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { CommandPath, DeploymentOperation } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import { AccountsPlan } from "../common/model"

export interface AccountsOperationInput extends CommandInput {
  readonly organizationalUnits: ReadonlyArray<string>
  readonly accountIds: ReadonlyArray<AccountId>
  readonly operation: DeploymentOperation
  readonly configSetType: ConfigSetType
  readonly concurrentAccounts: number
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
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

export interface AccountsLaunchPlan extends AccountsPlan {
  readonly hasChanges: boolean
}
