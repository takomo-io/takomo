import { ConfirmResult } from "@takomo/core"
import {
  CreateAccountIO,
  CreateAccountOutput,
} from "@takomo/organization-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createBaseIO } from "../../cli-io"

export const createCreateAccountIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): CreateAccountIO => {
  const io = createBaseIO(writer)

  const confirmAccountCreation = async (
    name: string,
    email: string,
    iamUserAccessToBilling: boolean,
    roleName: string,
    alias?: string,
  ): Promise<ConfirmResult> => {
    io.longMessage(
      [
        "Account information:",
        "",
        `  name:                        ${name}`,
        `  email:                       ${email}`,
        `  role name:                   ${roleName}`,
        `  iam user access to billing:  ${iamUserAccessToBilling}`,
        `  alias:                       ${alias || "<undefined>"}`,
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
            text: `Account creation failed. Reason: ${createAccountStatus.FailureReason}`,
            marginTop: true,
          })
        } else {
          io.message({ text: "Account creation failed", marginTop: true })
        }
        break
      case "SUCCESS":
        const { AccountId, AccountName } = createAccountStatus!
        io.longMessage(
          [
            "Account information:",
            "",
            `  id:   ${AccountId}`,
            `  name: ${AccountName}`,
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
