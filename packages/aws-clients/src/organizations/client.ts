import {
  AccountId,
  CreateAccountRequestId,
  CreateAccountStatus,
  DetailedOrganizationalUnit,
  DetailedOrganizationPolicy,
  Organization,
  OrganizationAccount,
  OrganizationalUnit,
  OrganizationFeatureSet,
  OrganizationPolicy,
  OrganizationPolicyId,
  OrganizationPolicySummary,
  OrganizationPolicyTargetSummary,
  OrganizationPolicyType,
  OrganizationRoot,
  ServicePrincipal,
} from "@takomo/aws-model"
import { sleep } from "@takomo/util"
import { Organizations } from "aws-sdk"
import {
  AttachPolicyRequest,
  CreateAccountRequest,
  CreateOrganizationalUnitRequest,
  CreatePolicyRequest,
  DetachPolicyRequest,
  DisablePolicyTypeRequest,
  EnablePolicyTypeRequest,
  MoveAccountRequest,
  UpdatePolicyRequest,
} from "aws-sdk/clients/organizations"
import { AwsClientProps, createClient } from "../common/client"
import {
  convertCreateAccountStatus,
  convertOrganization,
  convertOrganizationAccount,
  convertOrganizationAccounts,
  convertOrganizationalUnit,
  convertOrganizationalUnits,
  convertOrganizationPolicy,
  convertOrganizationPolicySummaries,
  convertOrganizationPolicyTargetSummaries,
  convertOrganizationRoots,
} from "./convert"

const ORGANIZATION_POLICY_TYPES: ReadonlyArray<OrganizationPolicyType> = [
  "SERVICE_CONTROL_POLICY",
  "TAG_POLICY",
  "AISERVICES_OPT_OUT_POLICY",
  "BACKUP_POLICY",
]

/**
 * @hidden
 */
export interface OrganizationsClient {
  listAccounts: () => Promise<ReadonlyArray<OrganizationAccount>>

  describeAccount: (accountId: AccountId) => Promise<OrganizationAccount>

  listPolicies: (
    type: OrganizationPolicyType,
  ) => Promise<ReadonlyArray<OrganizationPolicySummary>>

  listDetailedPolicies: (
    type: OrganizationPolicyType,
  ) => Promise<ReadonlyArray<DetailedOrganizationPolicy>>

  getDetailedPolicy: (
    policyId: OrganizationPolicyId,
  ) => Promise<DetailedOrganizationPolicy>

  listAllPoliciesForTarget: (
    targetId: string,
  ) => Promise<ReadonlyArray<OrganizationPolicySummary>>

  listPoliciesForTarget: (
    targetId: string,
    policyType: OrganizationPolicyType,
  ) => Promise<ReadonlyArray<OrganizationPolicySummary>>

  listTargetsAttachedToPolicy: (
    policyId: OrganizationPolicyId,
  ) => Promise<ReadonlyArray<OrganizationPolicyTargetSummary>>

  describePolicy: (
    policyId: OrganizationPolicyId,
  ) => Promise<OrganizationPolicy>

  deletePolicy: (policyId: OrganizationPolicyId) => Promise<boolean>

  createPolicy: (request: CreatePolicyRequest) => Promise<OrganizationPolicy>

  updatePolicy: (request: UpdatePolicyRequest) => Promise<OrganizationPolicy>

  attachPolicy: (request: AttachPolicyRequest) => Promise<boolean>

  detachPolicy: (request: DetachPolicyRequest) => Promise<boolean>

  createAccount: (request: CreateAccountRequest) => Promise<string>

  describeOrganization: () => Promise<Organization>

  listAccountsForParent: (
    parentId: string,
  ) => Promise<ReadonlyArray<OrganizationAccount>>
  moveAccount: (request: MoveAccountRequest) => Promise<boolean>

  listOrganizationalUnitsForParent: (
    parentId: string,
  ) => Promise<ReadonlyArray<OrganizationalUnit>>

  listOrganizationRoots: () => Promise<ReadonlyArray<OrganizationRoot>>

  listAllOrganizationUnitsWithDetails: () => Promise<
    ReadonlyArray<DetailedOrganizationalUnit>
  >

  createOrganizationalUnit: (
    request: CreateOrganizationalUnitRequest,
  ) => Promise<OrganizationalUnit>
  deleteOrganizationalUnit: (id: string) => Promise<boolean>

  listAWSServiceAccessForOrganization: () => Promise<
    ReadonlyArray<ServicePrincipal>
  >

  disableAWSServiceAccess: (
    servicePrincipal: ServicePrincipal,
  ) => Promise<boolean>

  enableAWSServiceAccess: (
    servicePrincipal: ServicePrincipal,
  ) => Promise<boolean>

  enablePolicyType: (request: EnablePolicyTypeRequest) => Promise<boolean>

  disablePolicyType: (request: DisablePolicyTypeRequest) => Promise<boolean>

  waitUntilPolicyTypeIsEnabled: (
    policyType: OrganizationPolicyType,
    millisToWait: number,
  ) => Promise<void>

  waitUntilPolicyTypeIsDisabled: (
    policyType: OrganizationPolicyType,
    millisToWait: number,
  ) => Promise<void>

  describeAccountCreationStatus: (
    requestId: string,
  ) => Promise<CreateAccountStatus>

  waitAccountCreationToComplete: (
    requestId: string,
  ) => Promise<CreateAccountStatus>

  createOrganization: (
    featureSet: OrganizationFeatureSet,
  ) => Promise<Organization>
}

/**
 * @hidden
 */
export const createOrganizationsClient = (
  props: AwsClientProps,
): OrganizationsClient => {
  const {
    withClient,
    pagedOperation,
    withClientPromise,
    logger,
  } = createClient({
    ...props,
    clientConstructor: (configuration) => new Organizations(configuration),
  })

  const listAccounts = async (): Promise<ReadonlyArray<OrganizationAccount>> =>
    withClient((c) =>
      pagedOperation(
        (params) => c.listAccounts(params),
        {},
        (res) => convertOrganizationAccounts(res),
      ),
    )

  const describeAccount = async (
    accountId: AccountId,
  ): Promise<OrganizationAccount> =>
    withClientPromise(
      (c) => c.describeAccount({ AccountId: accountId }),
      convertOrganizationAccount,
    )

  const listPolicies = async (
    type: OrganizationPolicyType,
  ): Promise<ReadonlyArray<OrganizationPolicySummary>> =>
    withClient((c) =>
      pagedOperation(
        (params) => c.listPolicies(params),
        { Filter: type },
        (res) => convertOrganizationPolicySummaries(res),
      ),
    )

  const listDetailedPolicies = async (
    type: OrganizationPolicyType,
  ): Promise<ReadonlyArray<DetailedOrganizationPolicy>> =>
    listPolicies(type).then((policies) =>
      Promise.all(policies.map((p) => p.id).map(getDetailedPolicy)),
    )

  const getDetailedPolicy = async (
    policyId: OrganizationPolicyId,
  ): Promise<DetailedOrganizationPolicy> =>
    Promise.all([
      describePolicy(policyId),
      listTargetsAttachedToPolicy(policyId),
    ]).then(([policy, targets]) => ({
      policy,
      targets,
    }))

  const listAllPoliciesForTarget = async (
    targetId: string,
  ): Promise<ReadonlyArray<OrganizationPolicySummary>> =>
    (
      await Promise.all(
        ORGANIZATION_POLICY_TYPES.map((policyType) =>
          listPoliciesForTarget(targetId, policyType),
        ),
      )
    ).flat()

  const listPoliciesForTarget = async (
    targetId: string,
    policyType: OrganizationPolicyType,
  ): Promise<ReadonlyArray<OrganizationPolicySummary>> =>
    withClient((c) =>
      pagedOperation(
        (params) => c.listPoliciesForTarget(params),
        { TargetId: targetId, Filter: policyType },
        (res) => convertOrganizationPolicySummaries(res),
      ),
    )

  const listTargetsAttachedToPolicy = async (
    policyId: OrganizationPolicyId,
  ): Promise<ReadonlyArray<OrganizationPolicyTargetSummary>> =>
    withClient((c) =>
      pagedOperation(
        (params) => c.listTargetsForPolicy(params),
        { PolicyId: policyId },
        (res) => convertOrganizationPolicyTargetSummaries(res),
      ),
    )

  const describePolicy = async (
    policyId: OrganizationPolicyId,
  ): Promise<OrganizationPolicy> =>
    withClientPromise(
      (c) => c.describePolicy({ PolicyId: policyId }),
      convertOrganizationPolicy,
    )

  const deletePolicy = async (
    policyId: OrganizationPolicyId,
  ): Promise<boolean> =>
    withClientPromise(
      (c) => c.deletePolicy({ PolicyId: policyId }),
      () => true,
    )

  const createPolicy = async (
    request: CreatePolicyRequest,
  ): Promise<OrganizationPolicy> =>
    withClientPromise((c) => c.createPolicy(request), convertOrganizationPolicy)

  const updatePolicy = async (
    request: UpdatePolicyRequest,
  ): Promise<OrganizationPolicy> =>
    withClientPromise((c) => c.updatePolicy(request), convertOrganizationPolicy)

  const attachPolicy = async (request: AttachPolicyRequest): Promise<boolean> =>
    withClientPromise(
      (c) => c.attachPolicy(request),
      () => true,
    )

  const detachPolicy = async (request: DetachPolicyRequest): Promise<boolean> =>
    withClientPromise(
      (c) => c.detachPolicy(request),
      () => true,
    )

  const createAccount = async (
    request: CreateAccountRequest,
  ): Promise<CreateAccountRequestId> =>
    withClientPromise(
      (c) => c.createAccount(request),
      (res) => convertCreateAccountStatus(res.CreateAccountStatus!).id,
    )

  const describeOrganization = async (): Promise<Organization> =>
    withClientPromise((c) => c.describeOrganization(), convertOrganization)

  const listAccountsForParent = async (
    parentId: string,
  ): Promise<ReadonlyArray<OrganizationAccount>> =>
    withClient((c) =>
      pagedOperation(
        (params) => c.listAccountsForParent(params),
        { ParentId: parentId },
        (res) => convertOrganizationAccounts(res),
      ),
    )

  const moveAccount = async (request: MoveAccountRequest): Promise<boolean> =>
    withClientPromise(
      (c) => c.moveAccount(request),
      () => true,
    )

  const listOrganizationalUnitsForParent = async (
    parentId: string,
  ): Promise<ReadonlyArray<OrganizationalUnit>> =>
    withClient((c) =>
      pagedOperation(
        (params) => c.listOrganizationalUnitsForParent(params),
        { ParentId: parentId },
        (res) => convertOrganizationalUnits(res),
      ),
    )

  const listOrganizationRoots = async (): Promise<
    ReadonlyArray<OrganizationRoot>
  > =>
    withClient((c) =>
      pagedOperation(
        (params) => c.listRoots(params),
        {},
        (res) => convertOrganizationRoots(res),
      ),
    )

  const listAllOrganizationUnitsWithDetails = async (): Promise<
    ReadonlyArray<DetailedOrganizationalUnit>
  > => {
    const roots = await listOrganizationRoots()
    return Promise.all(roots.map((root) => enrichOrganizationalUnit(root)))
  }

  const enrichOrganizationalUnit = async (
    ou: OrganizationalUnit,
  ): Promise<DetailedOrganizationalUnit> => {
    const [childOus, accounts] = await Promise.all([
      listOrganizationalUnitsForParent(ou.id),
      listAccountsForParent(ou.id),
    ])
    const children = await Promise.all(
      childOus.map((child) => enrichOrganizationalUnit(child)),
    )
    return {
      ou,
      children,
      accounts,
    }
  }

  const createOrganizationalUnit = async (
    request: CreateOrganizationalUnitRequest,
  ): Promise<OrganizationalUnit> =>
    withClientPromise(
      (c) => c.createOrganizationalUnit(request),
      convertOrganizationalUnit,
    )

  const deleteOrganizationalUnit = async (id: string): Promise<boolean> =>
    withClientPromise(
      (c) => c.deleteOrganizationalUnit({ OrganizationalUnitId: id }),
      () => true,
    )

  const listAWSServiceAccessForOrganization = async (): Promise<
    ReadonlyArray<ServicePrincipal>
  > =>
    withClientPromise(
      (c) => c.listAWSServiceAccessForOrganization(),
      (res) =>
        (res.EnabledServicePrincipals ?? []).map(
          (s) => s.ServicePrincipal as ServicePrincipal,
        ),
    )

  const disableAWSServiceAccess = async (
    servicePrincipal: ServicePrincipal,
  ): Promise<boolean> =>
    withClientPromise(
      (c) => c.disableAWSServiceAccess({ ServicePrincipal: servicePrincipal }),
      () => true,
    )

  const enableAWSServiceAccess = async (
    servicePrincipal: ServicePrincipal,
  ): Promise<boolean> =>
    withClientPromise(
      (c) => c.enableAWSServiceAccess({ ServicePrincipal: servicePrincipal }),
      () => true,
    )

  const enablePolicyType = async (
    request: EnablePolicyTypeRequest,
  ): Promise<boolean> =>
    withClientPromise(
      (c) => c.enablePolicyType(request),
      () => true,
    )

  const disablePolicyType = async (
    request: DisablePolicyTypeRequest,
  ): Promise<boolean> =>
    withClientPromise(
      (c) => c.disablePolicyType(request),
      () => true,
    )

  const waitUntilPolicyTypeIsEnabled = async (
    policyType: OrganizationPolicyType,
    millisToWait: number,
  ): Promise<void> => {
    const sleepMillis = 3000
    const policy = await listOrganizationRoots()
      .then((roots) => roots[0])
      .then((root) => root.policyTypes.find((p) => p.type === policyType))

    if (policy && policy.status === "ENABLED") {
      return
    }

    await sleep(sleepMillis)

    const waitTimeLeft = millisToWait - sleepMillis
    logger.debug(
      `Policy type ${policyType} not yet enabled, wait time left: ${waitTimeLeft}ms`,
    )

    if (waitTimeLeft < 0) {
      throw new Error(
        `Maximum wait time exceeded when waiting for policy type ${policyType} to become enabled`,
      )
    }

    return waitUntilPolicyTypeIsEnabled(policyType, waitTimeLeft)
  }

  const waitUntilPolicyTypeIsDisabled = async (
    policyType: OrganizationPolicyType,
    millisToWait: number,
  ): Promise<void> => {
    const sleepMillis = 3000
    const policy = await listOrganizationRoots()
      .then((roots) => roots[0])
      .then((root) => root.policyTypes.find((p) => p.type === policyType))

    if (!policy) {
      return
    }

    await sleep(sleepMillis)

    const waitTimeLeft = millisToWait - sleepMillis
    logger.debug(
      `Policy type ${policyType} not yet disabled, wait time left: ${waitTimeLeft}ms`,
    )

    if (waitTimeLeft < 0) {
      throw new Error(
        `Maximum wait time exceeded when waiting for policy type ${policyType} to become disabled`,
      )
    }

    return waitUntilPolicyTypeIsDisabled(policyType, waitTimeLeft)
  }

  const describeAccountCreationStatus = async (
    requestId: CreateAccountRequestId,
  ): Promise<CreateAccountStatus> =>
    withClientPromise(
      (c) =>
        c.describeCreateAccountStatus({ CreateAccountRequestId: requestId }),
      (res) => convertCreateAccountStatus(res.CreateAccountStatus!),
    )

  const waitAccountCreationToComplete = async (
    requestId: CreateAccountRequestId,
  ): Promise<CreateAccountStatus> => {
    while (true) {
      const status = await describeAccountCreationStatus(requestId)
      switch (status.state) {
        case "IN_PROGRESS":
          await sleep(5000)
          break
        case "FAILED":
          return status
        case "SUCCEEDED":
          return status
        default:
          throw new Error(`Unknown account creation state: ${status.state}`)
      }
    }
  }

  const createOrganization = async (
    featureSet: OrganizationFeatureSet,
  ): Promise<Organization> =>
    withClientPromise(
      (c) => c.createOrganization({ FeatureSet: featureSet }),
      convertOrganization,
    )

  return {
    attachPolicy,
    createAccount,
    createOrganization,
    createOrganizationalUnit,
    createPolicy,
    deleteOrganizationalUnit,
    deletePolicy,
    describeAccount,
    describeAccountCreationStatus,
    describeOrganization,
    describePolicy,
    detachPolicy,
    disableAWSServiceAccess,
    disablePolicyType,
    enableAWSServiceAccess,
    enablePolicyType,
    getDetailedPolicy,
    listAccounts,
    listAccountsForParent,
    listAllOrganizationUnitsWithDetails,
    listAllPoliciesForTarget,
    listAWSServiceAccessForOrganization,
    listDetailedPolicies,
    listOrganizationalUnitsForParent,
    listOrganizationRoots,
    listPolicies,
    listPoliciesForTarget,
    listTargetsAttachedToPolicy,
    moveAccount,
    updatePolicy,
    waitAccountCreationToComplete,
    waitUntilPolicyTypeIsDisabled,
    waitUntilPolicyTypeIsEnabled,
  }
}
