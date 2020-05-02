import { CommandStatus, ConfirmResult } from "@takomo/core"
import { StopWatch, TakomoError } from "@takomo/util"
import { OrganizationContext } from "../../../context"
import {
  CreateAccountInput,
  CreateAccountIO,
  CreateAccountOutput,
} from "./model"

export const createAccount = async (
  ctx: OrganizationContext,
  io: CreateAccountIO,
  input: CreateAccountInput,
): Promise<CreateAccountOutput> => {
  const { name, email, roleName, iamUserAccessToBilling, watch } = input
  const options = ctx.getOptions()

  const emailPattern = ctx.getOrganizationConfigFile().accountCreation
    .constraints.emailPattern
  if (emailPattern && !emailPattern.test(email)) {
    throw new TakomoError(
      `Provided email '${email}' does not match with required pattern ${emailPattern}`,
    )
  }

  const namePattern = ctx.getOrganizationConfigFile().accountCreation
    .constraints.namePattern
  if (namePattern && !namePattern.test(name)) {
    throw new TakomoError(
      `Provided name '${name}' does not match with required pattern ${namePattern}`,
    )
  }

  if (
    !options.isAutoConfirmEnabled() &&
    (await io.confirmAccountCreation(
      email,
      name,
      iamUserAccessToBilling,
      roleName,
    )) !== ConfirmResult.YES
  ) {
    return {
      success: false,
      createAccountStatus: null,
      status: CommandStatus.CANCELLED,
      message: "Cancelled",
      watch: new StopWatch("total").stop(),
    }
  }

  const client = ctx.getClient()

  io.info(`Initiate account creation`)
  const requestId = await client.createAccount({
    AccountName: name,
    Email: email,
    IamUserAccessToBilling: iamUserAccessToBilling ? "ALLOW" : "DENY",
    RoleName: roleName,
  })

  io.debug(`Account creation initiated with request id: ${requestId}`)
  io.info("Wait account creation to complete...")

  const createAccountStatus = await client.waitAccountCreationToComplete(
    requestId,
  )
  const success = createAccountStatus.State === "SUCCEEDED"
  const message = success ? "Success" : createAccountStatus.FailureReason!
  const status = success ? CommandStatus.SUCCESS : CommandStatus.FAILED

  return {
    createAccountStatus,
    success,
    message,
    status,
    watch: watch.stop(),
  }
}
