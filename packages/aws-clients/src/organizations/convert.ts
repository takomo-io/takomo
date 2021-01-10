import {
  AccountArn,
  AccountEmail,
  AccountId,
  AccountName,
  AccountStatus,
  Arn,
  Organization,
  OrganizationAccount,
  OrganizationalUnit,
  OrganizationalUnitArn,
  OrganizationalUnitId,
  OrganizationalUnitName,
  OrganizationArn,
  OrganizationFeatureSet,
  OrganizationId,
  OrganizationPolicy,
  OrganizationPolicyArn,
  OrganizationPolicyContent,
  OrganizationPolicyDescription,
  OrganizationPolicyId,
  OrganizationPolicyName,
  OrganizationPolicySummary,
  OrganizationPolicyTargetId,
  OrganizationPolicyTargetName,
  OrganizationPolicyTargetSummary,
  OrganizationPolicyTargetType,
  OrganizationPolicyType,
  OrganizationPolicyTypeStatus,
  OrganizationRoot,
  OrganizationRootArn,
  OrganizationRootId,
  OrganizationRootName,
} from "@takomo/aws-model"
import * as O from "aws-sdk/clients/organizations"

interface OrganizationHolder {
  Organization?: O.Organization
}

interface AccountsHolder {
  Accounts?: O.Account[]
}

interface AccountHolder {
  Account?: O.Account
}

interface PolicySummariesHolder {
  Policies?: O.PolicySummary[]
}

interface PolicySummaryHolder {
  Policy?: O.PolicySummary
}

interface PolicyHolder {
  Policy?: O.Policy
}

interface PolicyTargetSummaryHolder {
  Target?: O.PolicyTargetSummary
}

interface PolicyTargetSummariesHolder {
  Targets?: O.PolicyTargetSummary[]
}

interface OrganizationalUnitHolder {
  OrganizationalUnit?: O.OrganizationalUnit
}

interface OrganizationalUnitsHolder {
  OrganizationalUnits?: O.OrganizationalUnit[]
}

interface RootHolder {
  Root?: O.Root
}

interface RootsHolder {
  Roots?: O.Root[]
}

/**
 * @hidden
 */
export const convertOrganization = ({
  Organization,
}: OrganizationHolder): Organization => {
  if (!Organization) {
    throw new Error("Expected organization to be defined")
  }

  return {
    arn: Organization.Arn as OrganizationArn,
    featureSet: Organization.FeatureSet as OrganizationFeatureSet,
    id: Organization.Id as OrganizationId,
    masterAccountArn: Organization.MasterAccountArn as AccountArn,
    masterAccountEmail: Organization.MasterAccountEmail as AccountEmail,
    masterAccountId: Organization.MasterAccountId as AccountId,
  }
}

/**
 * @hidden
 */
export const convertOrganizationAccounts = ({
  Accounts,
}: AccountsHolder): ReadonlyArray<OrganizationAccount> =>
  Accounts
    ? Accounts.map((Account) => convertOrganizationAccount({ Account }))
    : []

/**
 * @hidden
 */
export const convertOrganizationAccount = ({
  Account,
}: AccountHolder): OrganizationAccount => {
  if (!Account) {
    throw new Error("Expected account to be defined")
  }

  return {
    id: Account.Id as AccountId,
    arn: Account.Arn as AccountArn,
    email: Account.Email as AccountEmail,
    joinedTimestamp: Account.JoinedTimestamp as Date,
    name: Account.Name as AccountName,
    status: Account.Status as AccountStatus,
  }
}

/**
 * @hidden
 */
export const convertOrganizationPolicySummary = ({
  Policy,
}: PolicySummaryHolder): OrganizationPolicySummary => {
  if (!Policy) {
    throw new Error("Expected policy summary to be defined")
  }

  return {
    arn: Policy.Arn as OrganizationPolicyArn,
    awsManaged: Policy.AwsManaged === true,
    description: Policy.Description as OrganizationPolicyDescription,
    id: Policy.Id as OrganizationPolicyId,
    name: Policy.Name as OrganizationPolicyName,
    type: Policy.Type as OrganizationPolicyType,
  }
}

/**
 * @hidden
 */
export const convertOrganizationPolicySummaries = ({
  Policies,
}: PolicySummariesHolder): ReadonlyArray<OrganizationPolicySummary> =>
  Policies
    ? Policies.map((Policy) => convertOrganizationPolicySummary({ Policy }))
    : []

/**
 * @hidden
 */
export const convertOrganizationPolicy = ({
  Policy,
}: PolicyHolder): OrganizationPolicy => {
  if (!Policy) {
    throw new Error("Expected policy to be defined")
  }

  return {
    summary: convertOrganizationPolicySummary({ Policy: Policy.PolicySummary }),
    content: Policy.Content as OrganizationPolicyContent,
  }
}

/**
 * @hidden
 */
export const convertOrganizationPolicyTargetSummary = ({
  Target,
}: PolicyTargetSummaryHolder): OrganizationPolicyTargetSummary => {
  if (!Target) {
    throw new Error("Expected policy target to be defined")
  }

  return {
    arn: Target.Arn as Arn,
    name: Target.Name as OrganizationPolicyTargetName,
    targetId: Target.TargetId as OrganizationPolicyTargetId,
    type: Target.Type as OrganizationPolicyTargetType,
  }
}

/**
 * @hidden
 */
export const convertOrganizationPolicyTargetSummaries = ({
  Targets,
}: PolicyTargetSummariesHolder): ReadonlyArray<
  OrganizationPolicyTargetSummary
> =>
  Targets
    ? Targets.map((Target) =>
        convertOrganizationPolicyTargetSummary({ Target }),
      )
    : []

/**
 * @hidden
 */
export const convertOrganizationalUnit = ({
  OrganizationalUnit,
}: OrganizationalUnitHolder): OrganizationalUnit => {
  if (!OrganizationalUnit) {
    throw new Error("Expected organizational unit to be defined")
  }

  return {
    arn: OrganizationalUnit.Arn as OrganizationalUnitArn,
    id: OrganizationalUnit.Id as OrganizationalUnitId,
    name: OrganizationalUnit.Name as OrganizationalUnitName,
  }
}

/**
 * @hidden
 */
export const convertOrganizationalUnits = ({
  OrganizationalUnits,
}: OrganizationalUnitsHolder): ReadonlyArray<OrganizationalUnit> =>
  OrganizationalUnits
    ? OrganizationalUnits.map((OrganizationalUnit) =>
        convertOrganizationalUnit({ OrganizationalUnit }),
      )
    : []

/**
 * @hidden
 */
export const convertOrganizationRoot = ({
  Root,
}: RootHolder): OrganizationRoot => {
  if (!Root) {
    throw new Error("Expected root to be defined")
  }

  return {
    arn: Root.Arn as OrganizationRootArn,
    id: Root.Id as OrganizationRootId,
    name: Root.Name as OrganizationRootName,
    policyTypes: (Root.PolicyTypes ?? []).map((p) => ({
      status: p.Status as OrganizationPolicyTypeStatus,
      type: p.Type as OrganizationPolicyType,
    })),
  }
}

/**
 * @hidden
 */
export const convertOrganizationRoots = ({
  Roots,
}: RootsHolder): ReadonlyArray<OrganizationRoot> =>
  Roots ? Roots.map((Root) => convertOrganizationRoot({ Root })) : []
