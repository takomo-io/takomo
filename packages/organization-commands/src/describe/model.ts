import {
  Organization,
  OrganizationAccount,
  OrganizationPolicyType,
} from "@takomo/aws-model"
import { CommandInput, CommandOutput, IO } from "@takomo/core"

export type DescribeOrganizationInput = CommandInput

export interface DescribeOrganizationOutput extends CommandOutput {
  readonly organization: Organization
  readonly enabledPolicies: ReadonlyArray<OrganizationPolicyType>
  readonly masterAccount: OrganizationAccount
}

export type DescribeOrganizationIO = IO<DescribeOrganizationOutput>
