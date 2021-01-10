import { OrganizationAccount } from "@takomo/aws-model"
import { OrganizationAccountConfig } from "@takomo/organization-config"
import { OrganizationState } from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import { EnabledPoliciesPlan } from "../basic-config/model"
import { createOrgEntityPoliciesPlan } from "./create-org-entity-policies-plan"
import { PlannedAccount } from "./model"

export const planAccountUpdate = (
  logger: TkmLogger,
  account: OrganizationAccount,
  localAccount: OrganizationAccountConfig,
  organizationState: OrganizationState,
  enabledPoliciesPlan: EnabledPoliciesPlan,
): PlannedAccount => {
  const id = account.id

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
