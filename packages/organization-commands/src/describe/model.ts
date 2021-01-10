import {
  Organization,
  OrganizationAccount,
  OrganizationPolicyType,
  ServicePrincipal,
} from "@takomo/aws-model"
import { CommandInput, CommandOutput, IO } from "@takomo/core"

export type DescribeOrganizationInput = CommandInput

export interface OrganizationService {
  readonly service: ServicePrincipal
  readonly enabled: boolean
}

export interface DescribeOrganizationOutput extends CommandOutput {
  readonly organization: Organization
  readonly services: ReadonlyArray<OrganizationService>
  readonly enabledPolicies: ReadonlyArray<OrganizationPolicyType>
  readonly masterAccount: OrganizationAccount
}

export type DescribeOrganizationIO = IO<DescribeOrganizationOutput>
