import { IamClient, OrganizationsClient } from "@takomo/aws-clients"
import {
  CommandStatus,
  ConfirmResult,
  TakomoCredentialProvider,
} from "@takomo/core"
import { OrganizationContext } from "@takomo/organization-context"
import { Failure, Logger, Result, Success, TakomoError } from "@takomo/util"
import { Policy } from "cockatiel"
import {
  CreateAccountInput,
  CreateAccountIO,
  CreateAccountOutput,
} from "./model"

const initiateAccountCreation = async (
  client: OrganizationsClient,
  { name, email, roleName, iamUserAccessToBilling }: CreateAccountInput,
): Promise<Result<Error, string>> =>
  client
    .createAccount({
      AccountName: name,
      Email: email,
      IamUserAccessToBilling: iamUserAccessToBilling ? "ALLOW" : "DENY",
      RoleName: roleName,
    })
    .then(Success.of)
    .catch(Failure.of)

const createCredentialProvider = async (
  ctx: OrganizationContext,
  logger: Logger,
  role: string,
): Promise<TakomoCredentialProvider> => {
  const retry = Policy.handleAll().retry().delay([2000, 4000, 8000, 16000])
  return retry.execute(() =>
    ctx.getCredentialProvider().createCredentialProviderForRole(role),
  )
}

const createAccountAlias = async (
  ctx: OrganizationContext,
  logger: Logger,
  accountId: string,
  roleName: string,
  alias: string,
): Promise<Result<Error, boolean>> => {
  const role = `arn:aws:iam::${accountId}:role/${roleName}`
  logger.debug(
    `Assume role ${role} from the new account to set the account alias`,
  )

  try {
    const credentialProvider = await createCredentialProvider(ctx, logger, role)

    const iam = new IamClient({
      logger,
      credentialProvider,
      region: "us-east-1",
    })

    return Success.of(await iam.createAccountAlias(alias))
  } catch (e) {
    return Failure.of(e)
  }
}

export const createAccount = async (
  ctx: OrganizationContext,
  io: CreateAccountIO,
  input: CreateAccountInput,
): Promise<CreateAccountOutput> => {
  const { name, email, roleName, alias, iamUserAccessToBilling, watch } = input
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
      name,
      email,
      iamUserAccessToBilling,
      roleName,
      alias,
    )) !== ConfirmResult.YES
  ) {
    return {
      success: false,
      createAccountStatus: null,
      status: CommandStatus.CANCELLED,
      message: "Cancelled",
      watch: watch.stop(),
    }
  }

  const client = ctx.getClient()

  io.info(`Initiate account creation`)
  const result = await initiateAccountCreation(client, input)
  if (!result.success) {
    return {
      success: false,
      createAccountStatus: null,
      status: CommandStatus.FAILED,
      message: result.error.message,
      watch: watch.stop(),
    }
  }

  io.debug(`Account creation initiated with request id: ${result.value}`)
  io.info("Wait account creation to complete...")

  const createAccountStatus = await client.waitAccountCreationToComplete(
    result.value,
  )

  const success = createAccountStatus.State === "SUCCEEDED"
  if (success && alias) {
    io.info("Account created successfully, set account alias...")
    const createAliasResult = await createAccountAlias(
      ctx,
      io,
      createAccountStatus.AccountId!,
      roleName,
      alias,
    )
    if (!createAliasResult.success) {
      io.error("Failed to set account alias", createAliasResult.error)
      return {
        success: false,
        createAccountStatus,
        status: CommandStatus.FAILED,
        message: createAliasResult.error.message,
        watch: watch.stop(),
      }
    }

    io.info("Account alias set successfully")
  }

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
