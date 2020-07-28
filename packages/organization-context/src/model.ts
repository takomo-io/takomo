import { DetailedOrganizationalUnit } from "@takomo/aws-clients"
import {
  Account,
  Organization,
  Policy,
  PolicyName,
  PolicyType,
} from "aws-sdk/clients/organizations"

export type OrgEntityId = string

export interface OrganizationData {
  readonly currentTagPolicies: Policy[]
  readonly currentServiceControlPolicies: Policy[]
  readonly currentAiServicesOptOutPolicies: Policy[]
  readonly currentBackupPolicies: Policy[]
  readonly currentServiceControlPoliciesByTarget: Map<string, PolicyName[]>
  readonly currentTagPoliciesByTarget: Map<string, PolicyName[]>
  readonly currentAiServicesOptOutPoliciesByTarget: Map<string, PolicyName[]>
  readonly currentBackupPoliciesByTarget: Map<string, PolicyName[]>
  readonly currentRootOrganizationalUnit: DetailedOrganizationalUnit
  readonly currentAccounts: Account[]
  readonly currentTrustedAwsServices: string[]
  readonly currentEnabledPolicies: PolicyType[]
  readonly currentOrganization: Organization
  readonly currentOrganizationHasAllFeaturesEnabled: boolean
}
