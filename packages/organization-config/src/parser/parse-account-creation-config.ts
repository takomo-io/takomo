import { parseRegex } from "@takomo/core"
import { DEFAULT_ORGANIZATION_ROLE_NAME } from "@takomo/organization-model"
import { AccountCreationConfig } from "../model"

export const parseAccountCreationConfig = (
  value: any,
): AccountCreationConfig => {
  if (value === null || value === undefined) {
    return {
      defaults: {
        roleName: DEFAULT_ORGANIZATION_ROLE_NAME,
        iamUserAccessToBilling: true,
      },
      constraints: {},
    }
  }

  const emailPattern = parseRegex(
    "accountCreation.constraints.emailPattern",
    value.emailPattern,
  )
  const namePattern = parseRegex(
    "accountCreation.constraints.namePattern",
    value.namePattern,
  )

  return {
    defaults: {
      roleName: value.accountAdminRoleName || DEFAULT_ORGANIZATION_ROLE_NAME,
      iamUserAccessToBilling: value.iamUserAccessToBilling !== false,
    },
    constraints: {
      emailPattern,
      namePattern,
    },
  }
}
