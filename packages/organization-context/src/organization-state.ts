import { DetailedOrganizationalUnit } from "@takomo/aws-clients"
import { AccountId, Constants } from "@takomo/core"
import { collectFromHierarchy } from "@takomo/util"
import {
  Account,
  Organization,
  OrganizationalUnit,
  OrganizationalUnitId,
  Policy,
  PolicyName,
  PolicyType,
} from "aws-sdk/clients/organizations"
import uniq from "lodash.uniq"
import { OrgEntityId } from "./model"

export type PoliciesByTypeByTargetMap = Map<
  PolicyType,
  Map<OrgEntityId, PolicyName[]>
>

export type PoliciesByTypeByName = Map<PolicyType, Map<PolicyName, Policy>>

export interface OrganizationStateProps {
  readonly rootOrganizationalUnit: DetailedOrganizationalUnit
  readonly accounts: Account[]
  readonly trustedAwsServices: string[]
  readonly enabledPolicies: PolicyType[]
  readonly organization: Organization
  readonly allFeaturesEnabled: boolean
  readonly policiesByTypeByName: PoliciesByTypeByName
  readonly policiesByTypeByTarget: PoliciesByTypeByTargetMap
  readonly parentByTargetId: Map<OrgEntityId, OrgEntityId>
  readonly organizationalUnitById: Map<
    OrganizationalUnitId,
    DetailedOrganizationalUnit
  >
}

/**
 * Represents the current organization state.
 */
export class OrganizationState {
  #props: OrganizationStateProps

  constructor(props: OrganizationStateProps) {
    this.#props = props
  }

  get enabledPolicies(): PolicyType[] {
    return this.#props.enabledPolicies.slice()
  }

  get trustedAwsServices(): string[] {
    return this.#props.trustedAwsServices.slice()
  }

  get allFeaturesEnabled(): boolean {
    return this.#props.allFeaturesEnabled
  }

  get accounts(): Account[] {
    return this.#props.accounts.slice()
  }

  get rootOrganizationalUnit(): DetailedOrganizationalUnit {
    return this.#props.rootOrganizationalUnit
  }

  /**
   * Get policies by type, or throw an error if no policy type is found.
   *
   * @param policyType
   * @return policies of given type
   * @throws error if no policy type is found
   */
  getPolicies = (policyType: PolicyType): Policy[] => {
    const policies = this.#props.policiesByTypeByName.get(policyType)
    if (!policies) {
      throw new Error(`Unknown policy type: '${policyType}'`)
    }

    return Array.from(policies.values())
  }

  /**
   * Get a policy by type and name, or null if no matching policy is found.
   *
   * @param policyType
   * @param policyName
   * @return policy of given type and name, or null if no matching policy is found
   */
  getPolicy = (policyType: PolicyType, policyName: PolicyName): Policy | null =>
    this.getPolicies(policyType).find(
      (p) => p.PolicySummary?.Name === policyName,
    ) || null

  /**
   * Get id of a policy by type and name, or throw an error if no matching policy is found.
   *
   * @param policyType
   * @param policyName
   * @return policy of given type and name
   * @throws error if no policy is found
   */
  getPolicyId = (policyType: PolicyType, policyName: PolicyName): string => {
    const policy = this.getPolicy(policyType, policyName)
    if (!policy) {
      throw new Error(
        `Policy of type '${policyType}' and name '${policyName}' not found`,
      )
    }

    return policy.PolicySummary!.Id!
  }

  /**
   * Set policy.
   *
   * @param policyType
   * @param policyName
   * @param policy
   */
  setPolicy = (
    policyType: PolicyType,
    policyName: PolicyName,
    policy: Policy,
  ): void => {
    const policies = this.#props.policiesByTypeByName.get(policyType)
    if (!policies) {
      throw new Error(`Unknown policy type: '${policyType}'`)
    }

    policies.set(policyName, policy)
  }

  /**
   * Get names of policies of given type attached directly to a target.
   *
   * @param policyType
   * @param targetId
   * @return names of policies of given type attached to a target
   */
  getPoliciesAttachedToTarget = (
    policyType: string,
    targetId: OrgEntityId,
  ): PolicyName[] => {
    const policiesByType = this.#props.policiesByTypeByTarget.get(policyType)
    if (!policiesByType) {
      throw new Error(`Unknown policy type: '${policyType}'`)
    }

    return policiesByType.get(targetId)?.slice() || []
  }

  /**
   * Get names of policies of given type inherited by a target.
   *
   * @param policyType
   * @param targetId
   * @return names of policies of given type inherited by a target
   */
  getPoliciesInheritedByTarget = (
    policyType: PolicyType,
    targetId: OrgEntityId,
  ): PolicyName[] => {
    const parentId = this.#props.parentByTargetId.get(targetId)
    if (!parentId) {
      return []
    }

    return uniq([
      ...this.getPoliciesAttachedToTarget(policyType, parentId),
      ...this.getPoliciesInheritedByTarget(policyType, parentId),
    ]).sort()
  }

  /**
   * Get account by id, or throw an error.
   *
   * @param accountId
   * @return account
   * @throws error if account is not found
   */
  getAccount = (accountId: AccountId): Account => {
    const account = this.#props.accounts.find((a) => a.Id === accountId)
    if (!account) {
      throw new Error(`Account '${accountId}' not found`)
    }

    return account
  }

  getParentOrganizationalUnit = (accountId: AccountId): OrganizationalUnit => {
    const parentId = this.#props.parentByTargetId.get(accountId)
    if (!parentId) {
      throw new Error(`Parent OU not found for account '${accountId}'`)
    }
    const ou = this.#props.organizationalUnitById.get(parentId)
    if (!ou) {
      throw new Error(`Parent OU not found for account '${accountId}'`)
    }

    return ou.ou
  }

  getAsObject = (): unknown => {
    const getPolicies = (policyType: PolicyType): any =>
      this.getPolicies(policyType).map((p) => ({
        id: p.PolicySummary?.Id,
        name: p.PolicySummary?.Name,
        description: p.PolicySummary?.Description,
        awsManaged: p.PolicySummary?.AwsManaged,
        arn: p.PolicySummary?.Arn,
      }))

    const policies = {
      serviceControl: getPolicies(Constants.SERVICE_CONTROL_POLICY_TYPE),
      tag: getPolicies(Constants.TAG_POLICY_TYPE),
      backup: getPolicies(Constants.BACKUP_POLICY_TYPE),
      aiServicesOptOut: getPolicies(Constants.AISERVICES_OPT_OUT_POLICY_TYPE),
    }

    const organizationalUnits = collectFromHierarchy(
      this.#props.rootOrganizationalUnit,
      (p) => p.children,
    ).map((ou) => {
      return {
        id: ou.ou.Id,
        name: ou.ou.Name,
        arn: ou.ou.Arn,
        policies: {
          serviceControl: {
            attached: this.getPoliciesAttachedToTarget(
              Constants.SERVICE_CONTROL_POLICY_TYPE,
              ou.ou.Id!,
            ),
            inherited: this.getPoliciesInheritedByTarget(
              Constants.SERVICE_CONTROL_POLICY_TYPE,
              ou.ou.Id!,
            ),
          },
          tag: {
            attached: this.getPoliciesAttachedToTarget(
              Constants.TAG_POLICY_TYPE,
              ou.ou.Id!,
            ),
            inherited: this.getPoliciesInheritedByTarget(
              Constants.TAG_POLICY_TYPE,
              ou.ou.Id!,
            ),
          },
          aiServicesOptOut: {
            attached: this.getPoliciesAttachedToTarget(
              Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
              ou.ou.Id!,
            ),
            inherited: this.getPoliciesInheritedByTarget(
              Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
              ou.ou.Id!,
            ),
          },
          backup: {
            attached: this.getPoliciesAttachedToTarget(
              Constants.BACKUP_POLICY_TYPE,
              ou.ou.Id!,
            ),
            inherited: this.getPoliciesInheritedByTarget(
              Constants.BACKUP_POLICY_TYPE,
              ou.ou.Id!,
            ),
          },
        },
        accounts: ou.accounts.map((a) => {
          return {
            id: a.Id,
            arn: a.Arn,
            email: a.Email,
            name: a.Name,
            policies: {
              serviceControl: {
                attached: this.getPoliciesAttachedToTarget(
                  Constants.SERVICE_CONTROL_POLICY_TYPE,
                  a.Id!,
                ),
                inherited: this.getPoliciesInheritedByTarget(
                  Constants.SERVICE_CONTROL_POLICY_TYPE,
                  a.Id!,
                ),
              },
              tag: {
                attached: this.getPoliciesAttachedToTarget(
                  Constants.TAG_POLICY_TYPE,
                  a.Id!,
                ),
                inherited: this.getPoliciesInheritedByTarget(
                  Constants.TAG_POLICY_TYPE,
                  a.Id!,
                ),
              },
              aiServicesOptOut: {
                attached: this.getPoliciesAttachedToTarget(
                  Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
                  a.Id!,
                ),
                inherited: this.getPoliciesInheritedByTarget(
                  Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
                  a.Id!,
                ),
              },
              backup: {
                attached: this.getPoliciesAttachedToTarget(
                  Constants.BACKUP_POLICY_TYPE,
                  a.Id!,
                ),
                inherited: this.getPoliciesInheritedByTarget(
                  Constants.BACKUP_POLICY_TYPE,
                  a.Id!,
                ),
              },
            },
          }
        }),
      }
    })

    return {
      trustedAwsServices: this.#props.trustedAwsServices,
      enabledPolicies: this.#props.enabledPolicies,
      policies,
      organizationalUnits,
    }
  }
}
