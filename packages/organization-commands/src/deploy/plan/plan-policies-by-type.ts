import { OrganizationPolicyConfig } from "@takomo/organization-config"
import { OrganizationState } from "@takomo/organization-context"
import {
  checksum,
  compactJson,
  readFileContents,
  TakomoError,
} from "@takomo/util"
import { PolicyType } from "aws-sdk/clients/organizations"
import path from "path"
import { PlannedPolicy, PolicyOperations } from "./model"

export const planPoliciesByType = async (
  type: PolicyType,
  localPolicies: OrganizationPolicyConfig[],
  organizationState: OrganizationState,
  policiesDir: string,
): Promise<PolicyOperations> => {
  const operations: PolicyOperations = {
    update: [],
    skip: [],
    add: [],
    remove: [],
  }

  for (const localPolicy of localPolicies) {
    const currentPolicy = organizationState.getPolicy(type, localPolicy.name)

    // TODO: Handle aws managed policies better
    if (localPolicy.awsManaged) {
      operations.skip.push({
        type,
        currentContent: currentPolicy!.Content!,
        currentDescription: currentPolicy!.PolicySummary!.Description!,
        id: currentPolicy!.PolicySummary!.Id!,
        name: localPolicy.name,
        newContent: "",
        awsManaged: true,
        newDescription: localPolicy.description,
      })

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

      const plannedPolicy: PlannedPolicy = {
        newContent,
        type,
        currentContent: currentPolicy.Content!,
        currentDescription: currentPolicy.PolicySummary!.Description!,
        id: currentPolicy.PolicySummary!.Id!,
        name: localPolicy.name,
        awsManaged: false,
        newDescription: localPolicy.description,
      }

      if (newChecksum !== currentChecksum) {
        operations.update.push(plannedPolicy)
      } else {
        operations.skip.push(plannedPolicy)
      }
    } else {
      operations.add.push({
        type,
        newContent,
        currentContent: null,
        currentDescription: null,
        id: null,
        name: localPolicy.name,
        awsManaged: false,
        newDescription: localPolicy.description,
      })
    }
  }

  const localPolicyNames = localPolicies.map((p) => p.name)

  organizationState
    .getPolicies(type)
    .filter((p) => !p.PolicySummary?.AwsManaged)
    .filter((p) => !localPolicyNames.includes(p.PolicySummary!.Name!))
    .forEach((p) => {
      operations.remove.push({
        currentContent: p.Content!,
        currentDescription: p.PolicySummary!.Description!,
        id: p.PolicySummary!.Id!,
        name: p.PolicySummary!.Name!,
        awsManaged: p.PolicySummary?.AwsManaged!,
        newContent: null,
        newDescription: null,
        type: p.PolicySummary!.Type!,
      })
    })

  return operations
}
