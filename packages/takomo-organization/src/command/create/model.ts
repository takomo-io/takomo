import { AccountId, CommandInput, CommandOutput, IO } from "@takomo/core"
import { Organization } from "aws-sdk/clients/organizations"

export interface CreateOrganizationInput extends CommandInput {
  readonly featureSet: string
}

export interface CreateOrganizationOutput extends CommandOutput {
  readonly organization: Organization | null
  readonly configurationFile: string | null
}

export interface CreateOrganizationIO extends IO {
  confirmOrganizationCreation(
    masterAccountId: AccountId,
    featureSet: string,
  ): Promise<boolean>
  printOutput(output: CreateOrganizationOutput): CreateOrganizationOutput
}
