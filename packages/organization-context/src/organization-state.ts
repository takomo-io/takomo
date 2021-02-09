import {
  AccountId,
  DetailedOrganizationalUnit,
  Organization,
  OrganizationAccount,
  OrganizationalUnit,
  OrganizationalUnitId,
  OrganizationPolicy,
  OrganizationPolicyName,
  OrganizationPolicyType,
} from "@takomo/aws-model"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { collectFromHierarchy } from "@takomo/util"
import uniq from "lodash.uniq"
import { OrgEntityId } from "./model"

export type PoliciesByTypeByTargetMap = Map<
  OrganizationPolicyType,
  Map<OrgEntityId, ReadonlyArray<OrganizationPolicyName>>
>

export type PoliciesByTypeByName = Map<
  OrganizationPolicyType,
  Map<OrganizationPolicyName, OrganizationPolicy>
>

export interface OrganizationStateProps {
  readonly rootOrganizationalUnit: DetailedOrganizationalUnit
  readonly accounts: ReadonlyArray<OrganizationAccount>
  readonly trustedAwsServices: ReadonlyArray<string>
  readonly enabledPolicies: ReadonlyArray<OrganizationPolicyType>
  readonly organization: Organization
  readonly allFeaturesEnabled: boolean
  readonly policiesByTypeByName: PoliciesByTypeByName
  readonly policiesByTypeByTarget: PoliciesByTypeByTargetMap
  readonly parentByTargetId: Map<OrgEntityId, OrgEntityId>
  readonly organizationalUnitById: Map<
    OrganizationalUnitId,
    DetailedOrganizationalUnit
  >
  readonly organizationalUnitByPath: Map<
    OrganizationalUnitPath,
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

  get enabledPolicies(): ReadonlyArray<OrganizationPolicyType> {
    return this.#props.enabledPolicies.slice()
  }

  get trustedAwsServices(): ReadonlyArray<string> {
    return this.#props.trustedAwsServices.slice()
  }

  get allFeaturesEnabled(): boolean {
    return this.#props.allFeaturesEnabled
  }

  get accounts(): ReadonlyArray<OrganizationAccount> {
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
  getPolicies = (
    policyType: OrganizationPolicyType,
  ): ReadonlyArray<OrganizationPolicy> => {
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
  getPolicy = (
    policyType: OrganizationPolicyType,
    policyName: OrganizationPolicyName,
  ): OrganizationPolicy | null =>
    this.getPolicies(policyType).find((p) => p.summary?.name === policyName) ||
    null

  /**
   * Get id of a policy by type and name, or throw an error if no matching policy is found.
   *
   * @param policyType
   * @param policyName
   * @return policy of given type and name
   * @throws error if no policy is found
   */
  getPolicyId = (
    policyType: OrganizationPolicyType,
    policyName: OrganizationPolicyName,
  ): string => {
    const policy = this.getPolicy(policyType, policyName)
    if (!policy) {
      throw new Error(
        `Policy of type '${policyType}' and name '${policyName}' not found`,
      )
    }

    return policy.summary.id
  }

  /**
   * Set policy.
   *
   * @param policyType
   * @param policyName
   * @param policy
   */
  setPolicy = (
    policyType: OrganizationPolicyType,
    policyName: OrganizationPolicyName,
    policy: OrganizationPolicy,
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
    policyType: OrganizationPolicyType,
    targetId: OrgEntityId,
  ): ReadonlyArray<OrganizationPolicyName> => {
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
    policyType: OrganizationPolicyType,
    targetId: OrgEntityId,
  ): ReadonlyArray<OrganizationPolicyName> => {
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
  getAccount = (accountId: AccountId): OrganizationAccount => {
    const account = this.#props.accounts.find((a) => a.id === accountId)
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

  getOrganizationalUnitByPath = (
    ouPath: OrganizationalUnitPath,
  ): OrganizationalUnit => {
    const ou = this.#props.organizationalUnitByPath.get(ouPath)
    if (!ou) {
      throw new Error(`OU not found with path '${ouPath}'`)
    }

    return ou.ou
  }

  getAsObject = (): unknown => {
    const getPolicies = (policyType: OrganizationPolicyType): any =>
      this.getPolicies(policyType).map((p) => ({
        id: p.summary?.id,
        name: p.summary?.name,
        description: p.summary?.description,
        awsManaged: p.summary?.awsManaged,
        arn: p.summary?.arn,
      }))

    const policies = {
      serviceControl: getPolicies("SERVICE_CONTROL_POLICY"),
      tag: getPolicies("TAG_POLICY"),
      backup: getPolicies("BACKUP_POLICY"),
      aiServicesOptOut: getPolicies("AISERVICES_OPT_OUT_POLICY"),
    }

    const organizationalUnits = collectFromHierarchy(
      this.#props.rootOrganizationalUnit,
      (p) => p.children,
    ).map((ou) => {
      return {
        id: ou.ou.id,
        name: ou.ou.name,
        arn: ou.ou.arn,
        policies: {
          serviceControl: {
            attached: this.getPoliciesAttachedToTarget(
              "SERVICE_CONTROL_POLICY",
              ou.ou.id,
            ),
            inherited: this.getPoliciesInheritedByTarget(
              "SERVICE_CONTROL_POLICY",
              ou.ou.id,
            ),
          },
          tag: {
            attached: this.getPoliciesAttachedToTarget("TAG_POLICY", ou.ou.id),
            inherited: this.getPoliciesInheritedByTarget(
              "TAG_POLICY",
              ou.ou.id,
            ),
          },
          aiServicesOptOut: {
            attached: this.getPoliciesAttachedToTarget(
              "AISERVICES_OPT_OUT_POLICY",
              ou.ou.id,
            ),
            inherited: this.getPoliciesInheritedByTarget(
              "AISERVICES_OPT_OUT_POLICY",
              ou.ou.id,
            ),
          },
          backup: {
            attached: this.getPoliciesAttachedToTarget(
              "BACKUP_POLICY",
              ou.ou.id,
            ),
            inherited: this.getPoliciesInheritedByTarget(
              "BACKUP_POLICY",
              ou.ou.id,
            ),
          },
        },
        accounts: ou.accounts.map((a) => {
          return {
            id: a.id,
            arn: a.arn,
            email: a.email,
            name: a.name,
            policies: {
              serviceControl: {
                attached: this.getPoliciesAttachedToTarget(
                  "SERVICE_CONTROL_POLICY",
                  a.id,
                ),
                inherited: this.getPoliciesInheritedByTarget(
                  "SERVICE_CONTROL_POLICY",
                  a.id,
                ),
              },
              tag: {
                attached: this.getPoliciesAttachedToTarget("TAG_POLICY", a.id),
                inherited: this.getPoliciesInheritedByTarget(
                  "TAG_POLICY",
                  a.id,
                ),
              },
              aiServicesOptOut: {
                attached: this.getPoliciesAttachedToTarget(
                  "AISERVICES_OPT_OUT_POLICY",
                  a.id,
                ),
                inherited: this.getPoliciesInheritedByTarget(
                  "AISERVICES_OPT_OUT_POLICY",
                  a.id,
                ),
              },
              backup: {
                attached: this.getPoliciesAttachedToTarget(
                  "BACKUP_POLICY",
                  a.id,
                ),
                inherited: this.getPoliciesInheritedByTarget(
                  "BACKUP_POLICY",
                  a.id,
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
