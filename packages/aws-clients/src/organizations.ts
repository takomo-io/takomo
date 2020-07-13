import { Constants, Region } from "@takomo/core"
import { sleep } from "@takomo/util"
import { Credentials, Organizations } from "aws-sdk"
import {
  Account,
  AttachPolicyRequest,
  CreateAccountRequest,
  CreateAccountStatus,
  CreateOrganizationalUnitRequest,
  CreatePolicyRequest,
  DetachPolicyRequest,
  DisablePolicyTypeRequest,
  EnabledServicePrincipal,
  EnablePolicyTypeRequest,
  MoveAccountRequest,
  Organization,
  OrganizationalUnit,
  Policy,
  PolicyId,
  PolicySummary,
  PolicyTargetSummary,
  PolicyType,
  Root,
  UpdatePolicyRequest,
} from "aws-sdk/clients/organizations"
import flatten from "lodash.flatten"
import { AwsClient, AwsClientClientProps } from "./aws-client"

export interface DetailedOrganizationalUnit {
  readonly ou: OrganizationalUnit
  readonly accounts: Account[]
  readonly children: DetailedOrganizationalUnit[]
}

export interface DetailedPolicy {
  readonly policy: Policy
  readonly targets: PolicyTargetSummary[]
}

export class OrganizationsClient extends AwsClient<Organizations> {
  constructor(props: AwsClientClientProps) {
    super(props)
  }

  protected getClient = (
    credentials: Credentials,
    region: Region,
  ): Organizations =>
    new Organizations({
      ...this.clientOptions(),
      credentials,
      region,
    })

  listAccounts = async (): Promise<Account[]> =>
    this.withClient((c) =>
      this.pagedOperation(
        (params) => c.listAccounts(params),
        {},
        (res) => res.Accounts,
      ),
    )

  describeAccount = async (accountId: string): Promise<Account> =>
    this.withClientPromise(
      (c) => c.describeAccount({ AccountId: accountId }),
      (res) => res.Account!,
    )

  listPolicies = async (type: PolicyType): Promise<PolicySummary[]> =>
    this.withClient((c) =>
      this.pagedOperation(
        (params) => c.listPolicies(params),
        { Filter: type },
        (res) => res.Policies,
      ),
    )

  listDetailedPolicies = async (type: PolicyType): Promise<DetailedPolicy[]> =>
    this.listPolicies(type).then((policies) =>
      Promise.all(policies.map((p) => p.Id!).map(this.getDetailedPolicy)),
    )

  getDetailedPolicy = async (policyId: PolicyId): Promise<DetailedPolicy> =>
    Promise.all([
      this.describePolicy(policyId),
      this.listTargetsAttachedToPolicy(policyId),
    ]).then(([policy, targets]) => ({
      policy,
      targets,
    }))

  listAllPoliciesForTarget = async (
    targetId: string,
  ): Promise<PolicySummary[]> =>
    flatten(
      await Promise.all(
        Constants.ORGANIZATION_POLICY_TYPES.map((policyType) =>
          this.listPoliciesForTarget(targetId, policyType),
        ),
      ),
    )

  listPoliciesForTarget = async (
    targetId: string,
    policyType: PolicyType,
  ): Promise<PolicySummary[]> =>
    this.withClient((c) =>
      this.pagedOperation(
        (params) => c.listPoliciesForTarget(params),
        { TargetId: targetId, Filter: policyType },
        (res) => res.Policies,
      ),
    )

  listTargetsAttachedToPolicy = async (
    policyId: string,
  ): Promise<PolicyTargetSummary[]> =>
    this.withClient((c) =>
      this.pagedOperation(
        (params) => c.listTargetsForPolicy(params),
        { PolicyId: policyId },
        (res) => res.Targets,
      ),
    )

  describePolicy = async (policyId: string): Promise<Policy> =>
    this.withClientPromise(
      (c) => c.describePolicy({ PolicyId: policyId }),
      (res) => res.Policy!,
    )

  deletePolicy = async (policyId: string): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.deletePolicy({ PolicyId: policyId }),
      () => true,
    )

  createPolicy = async (request: CreatePolicyRequest): Promise<Policy> =>
    this.withClientPromise(
      (c) => c.createPolicy(request),
      (res) => res.Policy!,
    )

  updatePolicy = async (request: UpdatePolicyRequest): Promise<Policy> =>
    this.withClientPromise(
      (c) => c.updatePolicy(request),
      (res) => res.Policy!,
    )

  attachPolicy = async (request: AttachPolicyRequest): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.attachPolicy(request),
      () => true,
    )

  detachPolicy = async (request: DetachPolicyRequest): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.detachPolicy(request),
      () => true,
    )

  createAccount = async (request: CreateAccountRequest): Promise<string> =>
    this.withClientPromise(
      (c) => c.createAccount(request),
      (res) => res.CreateAccountStatus?.Id!,
    )

  describeOrganization = async (): Promise<Organization> =>
    this.withClientPromise(
      (c) => c.describeOrganization(),
      (res) => res.Organization!,
    )

  listAccountsForParent = async (parentId: string): Promise<Account[]> =>
    this.withClient((c) =>
      this.pagedOperation(
        (params) => c.listAccountsForParent(params),
        { ParentId: parentId },
        (res) => res.Accounts,
      ),
    )

  moveAccount = async (request: MoveAccountRequest): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.moveAccount(request),
      () => true,
    )

  listOrganizationalUnitsForParent = async (
    parentId: string,
  ): Promise<OrganizationalUnit[]> =>
    this.withClient((c) =>
      this.pagedOperation(
        (params) => c.listOrganizationalUnitsForParent(params),
        { ParentId: parentId },
        (res) => res.OrganizationalUnits!,
      ),
    )

  listOrganizationRoots = async (): Promise<Root[]> =>
    this.withClient((c) =>
      this.pagedOperation(
        (params) => c.listRoots(params),
        {},
        (res) => res.Roots!,
      ),
    )

  listAllOrganizationUnitsWithDetails = async (): Promise<
    DetailedOrganizationalUnit[]
  > => {
    const roots = await this.listOrganizationRoots()
    return Promise.all(roots.map((root) => this.enrichOrganizationalUnit(root)))
  }

  private enrichOrganizationalUnit = async (
    ou: OrganizationalUnit,
  ): Promise<DetailedOrganizationalUnit> => {
    const [childOus, accounts] = await Promise.all([
      this.listOrganizationalUnitsForParent(ou.Id!),
      this.listAccountsForParent(ou.Id!),
    ])
    const children = await Promise.all(
      childOus.map((child) => this.enrichOrganizationalUnit(child)),
    )
    return {
      ou,
      children,
      accounts,
    }
  }

  createOrganizationalUnit = async (
    request: CreateOrganizationalUnitRequest,
  ): Promise<OrganizationalUnit> =>
    this.withClientPromise(
      (c) => c.createOrganizationalUnit(request),
      (res) => res.OrganizationalUnit!,
    )

  deleteOrganizationalUnit = async (id: string): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.deleteOrganizationalUnit({ OrganizationalUnitId: id }),
      () => true,
    )

  listAWSServiceAccessForOrganization = async (): Promise<
    EnabledServicePrincipal[]
  > =>
    this.withClientPromise(
      (c) => c.listAWSServiceAccessForOrganization(),
      (res) => res.EnabledServicePrincipals!,
    )

  disableAWSServiceAccess = async (
    servicePrincipal: string,
  ): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.disableAWSServiceAccess({ ServicePrincipal: servicePrincipal }),
      () => true,
    )

  enableAWSServiceAccess = async (servicePrincipal: string): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.enableAWSServiceAccess({ ServicePrincipal: servicePrincipal }),
      () => true,
    )

  enablePolicyType = async (
    request: EnablePolicyTypeRequest,
  ): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.enablePolicyType(request),
      () => true,
    )

  disablePolicyType = async (
    request: DisablePolicyTypeRequest,
  ): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.disablePolicyType(request),
      () => true,
    )

  waitUntilPolicyTypeIsEnabled = async (
    policyType: PolicyType,
    millisToWait: number,
  ): Promise<void> => {
    const sleepMillis = 3000
    const policy = await this.listOrganizationRoots()
      .then((roots) => roots[0])
      .then((root) => root.PolicyTypes!.find((p) => p.Type === policyType))

    if (policy && policy.Status === "ENABLED") {
      return
    }

    await sleep(sleepMillis)

    const waitTimeLeft = millisToWait - sleepMillis
    this.logger.debug(
      `Policy type ${policyType} not yet enabled, wait time left: ${waitTimeLeft}ms`,
    )

    if (waitTimeLeft < 0) {
      throw new Error(
        `Maximum wait time exceeded when waiting for policy type ${policyType} to become enabled`,
      )
    }

    return this.waitUntilPolicyTypeIsEnabled(policyType, waitTimeLeft)
  }

  waitUntilPolicyTypeIsDisabled = async (
    policyType: PolicyType,
    millisToWait: number,
  ): Promise<void> => {
    const sleepMillis = 3000
    const policy = await this.listOrganizationRoots()
      .then((roots) => roots[0])
      .then((root) => root.PolicyTypes!.find((p) => p.Type === policyType))

    if (!policy) {
      return
    }

    await sleep(sleepMillis)

    const waitTimeLeft = millisToWait - sleepMillis
    this.logger.debug(
      `Policy type ${policyType} not yet disabled, wait time left: ${waitTimeLeft}ms`,
    )

    if (waitTimeLeft < 0) {
      throw new Error(
        `Maximum wait time exceeded when waiting for policy type ${policyType} to become disabled`,
      )
    }

    return this.waitUntilPolicyTypeIsDisabled(policyType, waitTimeLeft)
  }

  describeAccountCreationStatus = async (
    requestId: string,
  ): Promise<CreateAccountStatus> =>
    this.withClientPromise(
      (c) =>
        c.describeCreateAccountStatus({ CreateAccountRequestId: requestId }),
      (res) => res.CreateAccountStatus!,
    )

  waitAccountCreationToComplete = async (
    requestId: string,
  ): Promise<CreateAccountStatus> => {
    while (true) {
      const status = await this.describeAccountCreationStatus(requestId)
      switch (status.State) {
        case "IN_PROGRESS":
          await sleep(5000)
          break
        case "FAILED":
          return status
        case "SUCCEEDED":
          return status
        default:
          throw new Error(`Unknown account creation state: ${status.State}`)
      }
    }
  }

  createOrganization = async (featureSet: string): Promise<Organization> =>
    this.withClientPromise(
      (c) => c.createOrganization({ FeatureSet: featureSet }),
      (res) => res.Organization!,
    )
}
