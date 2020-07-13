import { CommandInput, CommandOutput, ConfirmResult, IO } from "@takomo/core"
import { CreateAccountStatus } from "aws-sdk/clients/organizations"

export interface CreateAccountInput extends CommandInput {
  readonly email: string
  readonly name: string
  readonly iamUserAccessToBilling: boolean
  readonly roleName: string
}

export interface CreateAccountOutput extends CommandOutput {
  readonly createAccountStatus: CreateAccountStatus | null
}

export interface CreateAccountIO extends IO {
  confirmAccountCreation: (
    name: string,
    email: string,
    iamUserAccessToBilling: boolean,
    roleName: string,
  ) => Promise<ConfirmResult>

  printOutput(output: CreateAccountOutput): CreateAccountOutput
}
