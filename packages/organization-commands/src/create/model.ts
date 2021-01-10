import {
  AccountId,
  Organization,
  OrganizationFeatureSet,
} from "@takomo/aws-model"
import { CommandInput, CommandOutput, IO } from "@takomo/core"

export interface CreateOrganizationInput extends CommandInput {
  readonly featureSet: OrganizationFeatureSet
}

export interface CreateOrganizationOutput extends CommandOutput {
  readonly organization?: Organization
}

export interface CreateOrganizationIO extends IO<CreateOrganizationOutput> {
  readonly confirmOrganizationCreation: (
    masterAccountId: AccountId,
    featureSet: OrganizationFeatureSet,
  ) => Promise<boolean>
}
