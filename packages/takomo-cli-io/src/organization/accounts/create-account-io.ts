import { CommandStatus, ConfirmResult, Options } from "@takomo/core"
import { CreateAccountIO, CreateAccountOutput } from "@takomo/organization"
import CliIO from "../../cli-io"

export class CliCreateAccountIO extends CliIO implements CreateAccountIO {
  constructor(options: Options) {
    super(options)
  }

  confirmAccountCreation = async (
    name: string,
    email: string,
    iamUserAccessToBilling: boolean,
    roleName: string,
  ): Promise<ConfirmResult> => {
    this.longMessage(
      [
        "Account information:",
        "",
        `  name:                        ${name}`,
        `  email:                       ${email}`,
        `  role name:                   ${roleName}`,
        `  iam user access to billing:  ${iamUserAccessToBilling}`,
      ],
      true,
    )

    return (await this.confirm("Continue to create the account?", true))
      ? ConfirmResult.YES
      : ConfirmResult.NO
  }

  printOutput = (output: CreateAccountOutput): CreateAccountOutput => {
    const createAccountStatus = output.createAccountStatus

    switch (output.status) {
      case CommandStatus.FAILED:
        if (createAccountStatus) {
          this.message(
            `Account creation failed. Reason: ${createAccountStatus.FailureReason}`,
            true,
          )
        } else {
          this.message("Account creation failed", true)
        }
        break
      case CommandStatus.SUCCESS:
        const { AccountId, AccountName } = createAccountStatus!
        this.longMessage(
          [
            "Account information:",
            "",
            `  id:   ${AccountId}`,
            `  name: ${AccountName}`,
          ],
          true,
        )

        break
    }

    return output
  }
}
