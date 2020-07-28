import { Constants, parseRegex } from "@takomo/core"
import { AccountCreationConfig } from "../model"

export const parseAccountCreationConfig = (
  value: any,
): AccountCreationConfig => {
  if (value === null || value === undefined) {
    return {
      defaults: {
        roleName: Constants.DEFAULT_ORGANIZATION_ROLE_NAME,
        iamUserAccessToBilling: true,
      },
      constraints: {
        emailPattern: null,
        namePattern: null,
      },
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
      roleName:
        value.accountAdminRoleName || Constants.DEFAULT_ORGANIZATION_ROLE_NAME,
      iamUserAccessToBilling: value.iamUserAccessToBilling !== false,
    },
    constraints: {
      emailPattern,
      namePattern,
    },
  }
}
