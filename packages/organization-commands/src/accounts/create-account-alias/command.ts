import { createAwsSchemas } from "@takomo/aws-schema"
import { CommandContext, CommandHandler, ConfirmResult } from "@takomo/core"
import {
  buildOrganizationContext,
  OrganizationConfigRepository,
  OrganizationContext,
} from "@takomo/organization-context"
import { validateInput } from "@takomo/util"
import Joi, { ObjectSchema } from "joi"
import { createAccountAliasInternal } from "../common"
import {
  CreateAccountAliasInput,
  CreateAccountAliasIO,
  CreateAccountAliasOutput,
} from "./model"

const createAccountAlias = async (
  ctx: OrganizationContext,
  io: CreateAccountAliasIO,
  input: CreateAccountAliasInput,
): Promise<CreateAccountAliasOutput> => {
  const { timer, accountId, alias } = input

  if (!ctx.autoConfirmEnabled) {
    if ((await io.confirmCreateAlias(accountId, alias)) !== ConfirmResult.YES) {
      timer.stop()
      return {
        message: "Cancelled",
        success: false,
        status: "CANCELLED",
        timer,
      }
    }
  }

  const roleName = ctx.getAdminRoleNameForAccount(accountId)
  const result = await createAccountAliasInternal(
    ctx,
    io,
    accountId,
    roleName,
    alias,
  )

  if (!result.isOk()) {
    io.error("Failed to create account alias", result.error)
    timer.stop()
    return {
      message: "Failed",
      success: false,
      status: "FAILED",
      timer,
    }
  }

  timer.stop()
  return {
    message: "Success",
    success: true,
    status: "SUCCESS",
    timer,
  }
}

const inputSchema = (ctx: CommandContext): ObjectSchema => {
  const { accountId, accountAlias } = createAwsSchemas({
    regions: ctx.regions,
  })
  return Joi.object({
    accountId: accountId.required(),
    alias: accountAlias,
  }).unknown(true)
}

export const createAccountAliasCommand: CommandHandler<
  OrganizationConfigRepository,
  CreateAccountAliasIO,
  CreateAccountAliasInput,
  CreateAccountAliasOutput
> = async ({
  ctx,
  input,
  configRepository,
  io,
}): Promise<CreateAccountAliasOutput> =>
  validateInput(inputSchema(ctx), input)
    .then(() => buildOrganizationContext(ctx, configRepository, io))
    .then((ctx) => createAccountAlias(ctx, io, input))
    .then(io.printOutput)
