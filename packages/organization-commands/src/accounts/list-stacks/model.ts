import { AccountId } from "@takomo/aws-model"
import {
  ConfigSetName,
  ConfigSetType,
  CreateTargetListenerProps,
  PlanExecutionResult,
  TargetListener,
} from "@takomo/config-sets"
import { CommandInput, IO, OutputFormat } from "@takomo/core"
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
  extends PlanExecutionResult<ListStacksOutput> {
  readonly outputFormat: OutputFormat
}

export interface ListAccountsStacksIO extends IO<ListAccountsStacksOutput> {
  readonly createListStacksIO: (logger: TkmLogger) => ListStacksIO
  readonly createTargetListener: (
    props: CreateTargetListenerProps,
  ) => TargetListener
}
