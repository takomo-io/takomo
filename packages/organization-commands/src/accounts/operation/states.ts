import { CommandStatus } from "@takomo/core"
import {
  OrganizationConfigRepository,
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { Timer } from "@takomo/util"
import {
  AccountsOperationInput,
  AccountsOperationIO,
  AccountsOperationOutput,
  AccountsOperationPlan,
} from "./model"
import { AccountsOperationTransitions } from "./transitions"

export interface InitialAccountsOperationState {
  readonly totalTimer: Timer
  readonly transitions: AccountsOperationTransitions
  readonly ctx: OrganizationContext
  readonly configRepository: OrganizationConfigRepository
  readonly io: AccountsOperationIO
  readonly input: AccountsOperationInput
}

export interface OrganizationStateHolder extends InitialAccountsOperationState {
  readonly organizationState: OrganizationState
}

export interface AccountsOperationPlanHolder extends OrganizationStateHolder {
  readonly accountsLaunchPlan: AccountsOperationPlan
}

export interface AccountsOperationFailedState
  extends InitialAccountsOperationState {
  readonly message: string
  readonly error?: Error
}

export interface AccountsOperationSkippedState
  extends InitialAccountsOperationState {
  readonly message: string
}

export interface AccountsOperationCancelledState
  extends InitialAccountsOperationState {
  readonly message: string
}

export interface AccountsOperationCompletedState
  extends InitialAccountsOperationState {
  readonly success: boolean
  readonly message: string
  readonly status: CommandStatus
  readonly error?: Error
  readonly result?: AccountsOperationOutput
}
