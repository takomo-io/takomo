import { OrganizationsClient } from "@takomo/aws-clients"
import { ConfirmResult } from "@takomo/core"
import {
  loadOrganizationState,
  OrganizationConfigRepository,
  OrganizationContext,
} from "@takomo/organization-context"
import { sleep, TakomoError } from "@takomo/util"
import { ResultAsync } from "neverthrow"
import { createAccountAliasInternal } from "../common"
import { UnknownOrganizationalUnitError } from "./errors"
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
  configRepository: OrganizationConfigRepository,
  io: CreateAccountIO,
  input: CreateAccountInput,
): Promise<CreateAccountOutput> => {
  const {
    name,
    email,
    roleName,
    alias,
    iamUserAccessToBilling,
    ou,
    timer,
    config,
  } = input

  const emailPattern =
    ctx.organizationConfig.accountCreation.constraints.emailPattern
  if (emailPattern && !emailPattern.test(email)) {
    throw new TakomoError(
      `Provided email '${email}' does not match with required pattern: ${emailPattern}`,
    )
  }

  const namePattern =
    ctx.organizationConfig.accountCreation.constraints.namePattern
  if (namePattern && !namePattern.test(name)) {
    throw new TakomoError(
      `Provided name '${name}' does not match with required pattern: ${namePattern}`,
    )
  }

  if (ou && !ctx.hasOrganizationalUnit(ou)) {
    throw new UnknownOrganizationalUnitError(ou)
  }

  if (
    !ctx.autoConfirmEnabled &&
    (await io.confirmAccountCreation(
      name,
      email,
      iamUserAccessToBilling,
      roleName,
      alias,
      ou,
      config,
    )) !== ConfirmResult.YES
  ) {
    timer.stop()
    return {
      timer,
      success: false,
      status: "CANCELLED",
      message: "Cancelled",
    }
  }

  const client = await ctx.getClient()

  io.info(`Initiate account creation`)
  const result = await initiateAccountCreation(client, input)
  if (!result.isOk()) {
    timer.stop()
    return {
      timer,
      success: false,
      status: "FAILED",
      message: result.error.message,
    }
  }

  io.debug(`Account creation initiated with request id: ${result.value}`)
  io.info("Wait account creation to complete...")

  const createAccountStatus = await client.waitAccountCreationToComplete(
    result.value,
  )

  const success = createAccountStatus.state === "SUCCEEDED"

  if (!success) {
    const message = success
      ? "Success"
      : createAccountStatus.failureReason ?? "Failure"
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

  if (alias || ou) {
    // Wait some time for account to become ready
    await sleep(10000)
  }

  io.info("Account created successfully")

  if (alias) {
    io.info(`Set account alias to: '${alias}'`)
    const createAliasResult = await createAccountAliasInternal(
      ctx,
      io,
      createAccountStatus.accountId,
      roleName,
      alias,
    )
    if (!createAliasResult.isOk()) {
      io.error("Failed to set account alias", createAliasResult.error)
      timer.stop()
      return {
        timer,
        createAccountStatus,
        success: false,
        status: "FAILED",
        message: createAliasResult.error.message,
      }
    }

    io.info("Account alias set successfully")
  }

  if (ou) {
    const state = await loadOrganizationState(ctx, io)
    const sourceOu = state.getParentOrganizationalUnit(
      createAccountStatus.accountId,
    )

    const destinationOu = state.getOrganizationalUnitByPath(ou)

    io.info(`Move account to OU: ${ou}`)
    try {
      await client.moveAccount({
        AccountId: createAccountStatus.accountId,
        DestinationParentId: destinationOu.id,
        SourceParentId: sourceOu.id,
      })
      io.info("Account moved to OU")
    } catch (error) {
      io.error("Failed to set account OU", error)
      timer.stop()
      return {
        createAccountStatus,
        error,
        timer,
        success: false,
        status: "FAILED",
        message: "Failed to set account OU",
      }
    }
  }

  try {
    await configRepository.putAccountConfig({
      organizationalUnitPath: ou ?? "Root",
      ...(config ?? {}),
      id: createAccountStatus.accountId,
    })
  } catch (error) {
    io.error("Failed to persist account to account repository", error)
    timer.stop()
    return {
      createAccountStatus,
      error,
      timer,
      success: false,
      status: "FAILED",
      message: "Failed to persist account to account repository",
    }
  }

  timer.stop()
  return {
    createAccountStatus,
    timer,
    success: true,
    message: "Success",
    status: "SUCCESS",
  }
}
