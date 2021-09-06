import { AccountId } from "@takomo/aws-model"
import { ConfigSetName, ConfigSetType } from "@takomo/config-sets"
import { CommandInput, CommandOutput, IO } from "@takomo/core"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { CommandPath, DeploymentOperation } from "@takomo/stacks-model"

export interface ListAccountsStacksInput extends CommandInput {
  readonly organizationalUnits: ReadonlyArray<OrganizationalUnitPath>
  readonly accountIds: ReadonlyArray<AccountId>
  readonly operation: DeploymentOperation
  readonly configSetType: ConfigSetType
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}

export interface ListAccountsStacksOutput extends CommandOutput {
  readonly accounts: ReadonlyArray<string>
}

export type ListAccountsStacksIO = IO<ListAccountsStacksOutput>
