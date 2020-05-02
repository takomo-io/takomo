import { CommandInput, CommandOutput, IO } from "@takomo/core"
import {
  Account,
  EnabledServicePrincipal,
  Organization,
  PolicyType,
} from "aws-sdk/clients/organizations"

export type DescribeOrganizationInput = CommandInput

export interface DescribeOrganizationOutput extends CommandOutput {
  readonly organization: Organization
  readonly services: EnabledServicePrincipal[]
  readonly enabledPolicies: PolicyType[]
  readonly masterAccount: Account
}

export interface DescribeOrganizationIO extends IO {
  printOutput(output: DescribeOrganizationOutput): DescribeOrganizationOutput
}
