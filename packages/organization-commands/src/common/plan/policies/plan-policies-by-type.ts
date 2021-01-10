import { OrganizationPolicyType } from "@takomo/aws-model"
import { OrganizationPolicyConfig } from "@takomo/organization-config"
import {
  OrganizationConfigRepository,
  OrganizationState,
} from "@takomo/organization-context"
import { checksum, compactJson, TakomoError } from "@takomo/util"
import { PlannedPolicy, PolicyOperations } from "./model"

export const planPoliciesByType = async (
  type: OrganizationPolicyType,
  localPolicies: ReadonlyArray<OrganizationPolicyConfig>,
  organizationState: OrganizationState,
  configLoader: OrganizationConfigRepository,
): Promise<PolicyOperations> => {
  const update: PlannedPolicy[] = []
  const skip: PlannedPolicy[] = []
  const add: PlannedPolicy[] = []
  const remove: PlannedPolicy[] = []

  for (const localPolicy of localPolicies) {
    const currentPolicy = organizationState.getPolicy(type, localPolicy.name)

    if (localPolicy.awsManaged) {
      if (!currentPolicy) {
        throw new Error(
          `Expected policy of type '${type}' and name '${localPolicy.name}' to be defined`,
        )
      }

      skip.push({
        type,
        currentContent: currentPolicy.content,
        currentDescription: currentPolicy.summary.description,
        id: currentPolicy.summary.id,
        name: localPolicy.name,
        newContent: "",
        awsManaged: true,
        newDescription: localPolicy.description,
      })

      continue
    }

    if (currentPolicy && currentPolicy.summary.awsManaged) {
      throw new TakomoError(
        `Local policy '${localPolicy.name}' conflicts with an AWS managed policy with the same name`,
      )
    }

    // const policyFilePath = path.join(policiesDir, `${localPolicy.name}.json`)
    const policyContent = await configLoader.getOrganizationPolicyContents(
      type,
      localPolicy.name,
    )
    const newContent = compactJson(policyContent)

    if (currentPolicy) {
      const newChecksum = checksum(newContent + localPolicy.description)
      const currentChecksum = checksum(
        currentPolicy.content + currentPolicy.summary.description,
      )

      const plannedPolicy: PlannedPolicy = {
        newContent,
        type,
        currentContent: currentPolicy.content,
        currentDescription: currentPolicy.summary.description,
        id: currentPolicy.summary.id,
        name: localPolicy.name,
        awsManaged: false,
        newDescription: localPolicy.description,
      }

      if (newChecksum !== currentChecksum) {
        update.push(plannedPolicy)
      } else {
        skip.push(plannedPolicy)
      }
    } else {
      add.push({
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
    .filter((p) => !p.summary.awsManaged)
    .filter((p) => !localPolicyNames.includes(p.summary.name))
    .forEach((p) => {
      remove.push({
        currentContent: p.content,
        currentDescription: p.summary.description,
        id: p.summary.id,
        name: p.summary.name,
        awsManaged: p.summary.awsManaged,
        newContent: null,
        newDescription: null,
        type: p.summary.type,
      })
    })

  return {
    update,
    skip,
    add,
    remove,
  }
}
