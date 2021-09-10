import { IamRoleName } from "@takomo/aws-model"
import { parseRegex } from "@takomo/core"
import { AccountCreationConfig } from "../model"

export const parseAccountCreationConfig = (
  value: any,
  defaultAccountAdminRoleName: IamRoleName,
): AccountCreationConfig => {
  if (value === null || value === undefined) {
    return {
      defaults: {
        roleName: defaultAccountAdminRoleName,
        iamUserAccessToBilling: true,
      },
      constraints: {},
    }
  }

  const emailPattern = parseRegex(
    "accountCreation.constraints.emailPattern",
    value.constraints?.emailPattern,
  )
  const namePattern = parseRegex(
    "accountCreation.constraints.namePattern",
    value.constraints?.namePattern,
  )

  return {
    defaults: {
      roleName: value.accountAdminRoleName ?? defaultAccountAdminRoleName,
      iamUserAccessToBilling: value.iamUserAccessToBilling !== false,
    },
    constraints: {
      emailPattern,
      namePattern,
    },
  }
}
