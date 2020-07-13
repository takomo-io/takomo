import { OrganizationAccount } from "@takomo/organization-config"
import { OrganizationState } from "@takomo/organization-context"
import { Logger } from "@takomo/util"
import { Account } from "aws-sdk/clients/organizations"
import { createOrgEntityPoliciesPlan } from "./create-org-entity-policies-plan"
import { EnabledPoliciesPlan, PlannedAccount } from "./model"

export const planAccountUpdate = (
  logger: Logger,
  account: Account,
  localAccount: OrganizationAccount,
  organizationState: OrganizationState,
  enabledPoliciesPlan: EnabledPoliciesPlan,
): PlannedAccount => {
  const id = account.Id!

  const policies = createOrgEntityPoliciesPlan(
    logger,
    id,
    localAccount.policies,
    organizationState,
    enabledPoliciesPlan,
  )

  const operation = policies.hasChanges ? "update" : "skip"

  return {
    id,
    operation,
    policies,
  }
}
