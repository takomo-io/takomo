import { AccountId } from "@takomo/aws-model"
import { ConfigSetName, ConfigSetType } from "@takomo/config-sets"
import { CommandInput, IO, OutputFormat } from "@takomo/core"
import {
  ConfigSetPlanExecutionResult,
  ConfigSetTargetListener,
  CreateConfigSetTargetListenerProps,
} from "@takomo/execution-plans"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { ListStacksIO, ListStacksOutput } from "@takomo/stacks-commands"
import { CommandPath } from "@takomo/stacks-model"
import { TkmLogger } from "@takomo/util"

export interface ListAccountsStacksInput extends CommandInput {
  readonly organizationalUnits: ReadonlyArray<OrganizationalUnitPath>
  readonly accountIds: ReadonlyArray<AccountId>
  readonly concurrentAccounts: number
  readonly configSetType: ConfigSetType
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}

export interface ListAccountsStacksOutput
  extends ConfigSetPlanExecutionResult<ListStacksOutput> {
  readonly outputFormat: OutputFormat
}

export interface ListAccountsStacksIO extends IO<ListAccountsStacksOutput> {
  readonly createListStacksIO: (logger: TkmLogger) => ListStacksIO
  readonly createTargetListener: (
    props: CreateConfigSetTargetListenerProps,
  ) => ConfigSetTargetListener
}
