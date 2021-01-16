import { OrganizationsClient } from "@takomo/aws-clients"
import { ConfirmResult } from "@takomo/core"
import { OrganizationContext } from "@takomo/organization-context"
import { sleep, TakomoError } from "@takomo/util"
import { ResultAsync } from "neverthrow"
import { createAccountAliasInternal } from "../common"
import {
  CreateAccountInput,
  CreateAccountIO,
  CreateAccountOutput,
} from "./model"

const initiateAccountCreation = (
  client: OrganizationsClient,
  { name, email, roleName, iamUserAccessToBilling }: CreateAccountInput,
): ResultAsync<string, Error> =>
  ResultAsync.fromPromise(
    client.createAccount({
      AccountName: name,
      Email: email,
      IamUserAccessToBilling: iamUserAccessToBilling ? "ALLOW" : "DENY",
      RoleName: roleName,
    }),
    (e) => e as Error,
  )

export const createAccount = async (
  ctx: OrganizationContext,
  io: CreateAccountIO,
  input: CreateAccountInput,
): Promise<CreateAccountOutput> => {
  const { name, email, roleName, alias, iamUserAccessToBilling, timer } = input

  const emailPattern =
    ctx.organizationConfig.accountCreation.constraints.emailPattern
  if (emailPattern && !emailPattern.test(email)) {
    throw new TakomoError(
      `Provided email '${email}' does not match with required pattern ${emailPattern}`,
    )
  }

  const namePattern =
    ctx.organizationConfig.accountCreation.constraints.namePattern
  if (namePattern && !namePattern.test(name)) {
    throw new TakomoError(
      `Provided name '${name}' does not match with required pattern ${namePattern}`,
    )
  }

  if (
    !ctx.autoConfirmEnabled &&
    (await io.confirmAccountCreation(
      name,
      email,
      iamUserAccessToBilling,
      roleName,
      alias,
    )) !== ConfirmResult.YES
  ) {
    timer.stop()
    return {
      success: false,
      createAccountStatus: null,
      status: "CANCELLED",
      message: "Cancelled",
      timer,
    }
  }

  const client = ctx.getClient()

  io.info(`Initiate account creation`)
  const result = await initiateAccountCreation(client, input)
  if (!result.isOk()) {
    timer.stop()
    return {
      success: false,
      createAccountStatus: null,
      status: "FAILED",
      message: result.error.message,
      timer,
    }
  }

  io.debug(`Account creation initiated with request id: ${result.value}`)
  io.info("Wait account creation to complete...")

  const createAccountStatus = await client.waitAccountCreationToComplete(
    result.value,
  )

  const success = createAccountStatus.State === "SUCCEEDED"
  if (success && alias) {
    await sleep(10000)
    io.info("Account created successfully, set account alias...")
    const createAliasResult = await createAccountAliasInternal(
      ctx,
      io,
      createAccountStatus.AccountId!,
      roleName,
      alias,
    )
    if (!createAliasResult.isOk()) {
      io.error("Failed to set account alias", createAliasResult.error)
      timer.stop()
      return {
        success: false,
        createAccountStatus,
        status: "FAILED",
        message: createAliasResult.error.message,
        timer,
      }
    }

    io.info("Account alias set successfully")
  }

  const message = success ? "Success" : createAccountStatus.FailureReason!
  const status = success ? "SUCCESS" : "FAILED"

  timer.stop()
  return {
    createAccountStatus,
    success,
    message,
    status,
    timer,
  }
}
