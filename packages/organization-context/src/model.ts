import {
  OrganizationPolicyName,
  OrganizationPolicyType,
} from "@takomo/aws-model"
import { ConfigSetName } from "@takomo/config-sets"
import { AccountConfigItem } from "@takomo/organization-account-repository"
import { OrganizationConfig } from "@takomo/organization-config"
import { StacksConfigRepository } from "@takomo/stacks-context"

export type OrgEntityId = string

export interface OrganizationConfigRepository extends StacksConfigRepository {
  readonly getOrganizationConfig: () => Promise<OrganizationConfig>
  readonly putOrganizationConfig: (config: OrganizationConfig) => Promise<void>
  readonly getOrganizationPolicyContents: (
    policyType: OrganizationPolicyType,
    policyName: OrganizationPolicyName,
    dynamic: boolean,
  ) => Promise<string>
  readonly putAccountConfig: (config: AccountConfigItem) => Promise<void>
  readonly createStacksConfigRepository: (
    configSetName: ConfigSetName,
    legacy: boolean,
  ) => Promise<StacksConfigRepository>
}
