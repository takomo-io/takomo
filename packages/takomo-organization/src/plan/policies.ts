import { Constants } from "@takomo/core"
import {
  checksum,
  compactJson,
  readFileContents,
  TakomoError,
} from "@takomo/util"
import { Policy } from "aws-sdk/clients/organizations"
import path from "path"
import { OrganizationContext } from "../context"
import {
  OrganizationData,
  PlannedPolicy,
  PoliciesConfig,
  PolicyConfig,
  PolicyDeploymentPlan,
} from "../model"

export const planPoliciesByType = async (
  type: string,
  localPolicies: PolicyConfig[],
  currentPoliciesMap: Map<string, Policy>,
  policiesDir: string,
): Promise<PlannedPolicy[]> => {
  const policiesToUpdate = new Array<PlannedPolicy>()
  for (const localPolicy of localPolicies) {
    const currentPolicy = currentPoliciesMap.get(localPolicy.name)

    // TODO: Handle aws managed policies better
    if (localPolicy.awsManaged) {
      const plannedPolicy: PlannedPolicy = {
        currentContent: currentPolicy!.Content!,
        currentDescription: currentPolicy!.PolicySummary!.Description!,
        id: currentPolicy!.PolicySummary!.Id!,
        name: localPolicy.name,
        newContent: "",
        awsManaged: true,
        newDescription: localPolicy.description,
        operation: "skip",
        type,
      }

      policiesToUpdate.push(plannedPolicy)
      continue
    }

    if (currentPolicy && currentPolicy.PolicySummary?.AwsManaged) {
      throw new TakomoError(
        `Local policy '${localPolicy.name}' conflicts with an AWS managed policy with the same name`,
      )
    }

    const policyFilePath = path.join(policiesDir, `${localPolicy.name}.json`)
    const policyContent = await readFileContents(policyFilePath)
    const newContent = compactJson(policyContent)

    if (currentPolicy) {
      const newChecksum = checksum(newContent + localPolicy.description)
      const currentChecksum = checksum(
        currentPolicy.Content! + currentPolicy.PolicySummary!.Description!,
      )

      const operation = newChecksum !== currentChecksum ? "update" : "skip"

      const plannedPolicy: PlannedPolicy = {
        currentContent: currentPolicy.Content!,
        currentDescription: currentPolicy.PolicySummary!.Description!,
        id: currentPolicy.PolicySummary!.Id!,
        name: localPolicy.name,
        awsManaged: false,
        newContent,
        newDescription: localPolicy.description,
        operation,
        type,
      }

      policiesToUpdate.push(plannedPolicy)
    } else {
      const plannedPolicy: PlannedPolicy = {
        currentContent: null,
        currentDescription: null,
        id: null,
        name: localPolicy.name,
        awsManaged: false,
        newContent,
        newDescription: localPolicy.description,
        operation: "add",
        type,
      }

      policiesToUpdate.push(plannedPolicy)
    }
  }

  return policiesToUpdate
}

export const createPoliciesDeploymentPlan = async (
  localServiceControlPoliciesConfig: PoliciesConfig,
  localTagPoliciesConfig: PoliciesConfig,
  currentServiceControlPolicies: Policy[],
  currentTagPolicies: Policy[],
  organizationDir: string,
): Promise<PolicyDeploymentPlan> => {
  const currentServiceControlPoliciesMap = new Map(
    currentServiceControlPolicies.map((p) => [p.PolicySummary!.Name!, p]),
  )
  const currentTagPoliciesMap = new Map(
    currentTagPolicies.map((p) => [p.PolicySummary!.Name!, p]),
  )

  const [servicePolicies, tagPolicies] = await Promise.all([
    planPoliciesByType(
      Constants.SERVICE_CONTROL_POLICY_TYPE,
      localServiceControlPoliciesConfig.policies,
      currentServiceControlPoliciesMap,
      path.join(organizationDir, "service-control-policies"),
    ),
    planPoliciesByType(
      Constants.TAG_POLICY_TYPE,
      localTagPoliciesConfig.policies,
      currentTagPoliciesMap,
      path.join(organizationDir, "tag-policies"),
    ),
  ])

  const localPolicies = [...servicePolicies, ...tagPolicies]
  const localPolicyNames = localPolicies.map((p) => p.name)

  const serviceControlPoliciesToDelete = currentServiceControlPolicies
    .filter((p) => !p.PolicySummary?.AwsManaged)
    .filter((p) => !localPolicyNames.includes(p.PolicySummary!.Name!))
    .map((p) => {
      return {
        currentContent: p.Content!,
        currentDescription: p.PolicySummary!.Description!,
        id: p.PolicySummary!.Id!,
        name: p.PolicySummary!.Name!,
        awsManaged: p.PolicySummary?.AwsManaged!,
        newContent: null,
        newDescription: null,
        operation: "delete",
        type: p.PolicySummary!.Type!,
      }
    })

  const tagPoliciesToDelete = currentTagPolicies
    .filter((p) => !p.PolicySummary?.AwsManaged)
    .filter((p) => !localPolicyNames.includes(p.PolicySummary!.Name!))
    .map((p) => {
      return {
        currentContent: p.Content!,
        currentDescription: p.PolicySummary!.Description!,
        id: p.PolicySummary!.Id!,
        name: p.PolicySummary!.Name!,
        awsManaged: p.PolicySummary?.AwsManaged!,
        newContent: null,
        newDescription: null,
        operation: "delete",
        type: p.PolicySummary!.Type!,
      }
    })

  const policies = [
    ...localPolicies,
    ...serviceControlPoliciesToDelete,
    ...tagPoliciesToDelete,
  ]
  const hasChanges =
    policies.filter((p) => p.operation === "skip").length !== policies.length

  return {
    hasChanges,
    skip: false,
    serviceControlPolicies: [
      ...servicePolicies,
      ...serviceControlPoliciesToDelete,
    ],
    tagPolicies: [...tagPolicies, ...tagPoliciesToDelete],
  }
}

export const planPoliciesDeployment = async (
  ctx: OrganizationContext,
  data: OrganizationData,
): Promise<PolicyDeploymentPlan> => {
  const {
    currentOrganizationHasAllFeaturesEnabled,
    currentServiceControlPolicies,
    currentTagPolicies,
  } = data

  const logger = ctx.getLogger()

  if (!currentOrganizationHasAllFeaturesEnabled) {
    logger.debug(
      "Organization does not have all features enabled, skip policies deployment planning",
    )
    return {
      skip: true,
      hasChanges: false,
      tagPolicies: [],
      serviceControlPolicies: [],
    }
  }

  const organizationConfigFile = ctx.getOrganizationConfigFile()
  const options = ctx.getOptions()
  const organizationDir = path.join(options.getProjectDir(), "organization")
  const { serviceControlPolicies, tagPolicies } = organizationConfigFile

  return createPoliciesDeploymentPlan(
    serviceControlPolicies,
    tagPolicies,
    currentServiceControlPolicies,
    currentTagPolicies,
    organizationDir,
  )
}
