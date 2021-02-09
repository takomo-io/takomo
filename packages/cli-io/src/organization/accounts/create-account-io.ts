import { AccountAlias, AccountEmail, AccountName } from "@takomo/aws-model"
import { ConfirmResult } from "@takomo/core"
import {
  CreateAccountIO,
  CreateAccountOutput,
} from "@takomo/organization-commands"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { formatYaml, table } from "@takomo/util"
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
    config?: Record<string, unknown>,
  ): Promise<ConfirmResult> => {
    io.header({ text: "Review account creation plan:", marginTop: true })
    io.message({ text: "Basic information:", marginTop: true })
    io.table({
      table: table({ headers: ["prop", "value"] })
        .row("name:", name)
        .row("email:", email)
        .row("role name:", roleName)
        .row("iam user access to billing:", iamUserAccessToBilling)
        .row("organizational unit:", ou ?? "<undefined>")
        .row("alias:", alias ?? "<undefined>"),
      marginTop: true,
      showHeaders: false,
      indent: 2,
    })

    io.message({ text: "Configuration:", marginTop: true })
    if (!config || Object.keys(config).length === 0) {
      io.message({ text: "none", indent: 2, marginTop: true })
    } else {
      io.message({ text: formatYaml(config), indent: 2, marginTop: true })
    }

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
