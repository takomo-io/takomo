import { AccountAlias, AccountEmail, AccountName } from "@takomo/aws-model"
import { ConfirmResult } from "@takomo/core"
import {
  CreateAccountIO,
  CreateAccountOutput,
} from "@takomo/organization-commands"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { createBaseIO } from "../../cli-io"
import { IOProps } from "../../stacks/common"

export const createCreateAccountIO = (props: IOProps): CreateAccountIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const confirmAccountCreation = async (
    name: AccountName,
    email: AccountEmail,
    iamUserAccessToBilling: boolean,
    roleName: string,
    alias?: AccountAlias,
    ou?: OrganizationalUnitPath,
  ): Promise<ConfirmResult> => {
    io.longMessage(
      [
        "Account information:",
        "",
        `  name:                        ${name}`,
        `  email:                       ${email}`,
        `  role name:                   ${roleName}`,
        `  iam user access to billing:  ${iamUserAccessToBilling}`,
        `  organizational unit:         ${ou ?? "<undefined>"}`,
        `  alias:                       ${alias ?? "<undefined>"}`,
      ],
      true,
      false,
      0,
    )

    return (await io.confirm("Continue to create the account?", true))
      ? ConfirmResult.YES
      : ConfirmResult.NO
  }

  const printOutput = (output: CreateAccountOutput): CreateAccountOutput => {
    const createAccountStatus = output.createAccountStatus

    switch (output.status) {
      case "FAILED":
        if (createAccountStatus) {
          io.message({
            text: `Account creation failed. Reason: ${createAccountStatus.failureReason}`,
            marginTop: true,
          })
        } else {
          io.message({ text: "Account creation failed", marginTop: true })
        }
        break
      case "SUCCESS":
        const { accountId, accountName } = createAccountStatus!
        io.longMessage(
          [
            "Account information:",
            "",
            `  id:   ${accountId}`,
            `  name: ${accountName}`,
          ],
          true,
          false,
          0,
        )

        break
    }

    return output
  }

  return {
    ...logger,
    confirmAccountCreation,
    printOutput,
  }
}
