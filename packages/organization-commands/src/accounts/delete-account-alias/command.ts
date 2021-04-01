import { createAwsSchemas } from "@takomo/aws-schema"
import { CommandContext, CommandHandler, ConfirmResult } from "@takomo/core"
import {
  buildOrganizationContext,
  OrganizationConfigRepository,
  OrganizationContext,
} from "@takomo/organization-context"
import { validateInput } from "@takomo/util"
import Joi, { ObjectSchema } from "joi"
import { deleteAccountAliasInternal } from "../common"
import {
  DeleteAccountAliasInput,
  DeleteAccountAliasIO,
  DeleteAccountAliasOutput,
} from "./model"

const inputSchema = (ctx: CommandContext): ObjectSchema => {
  const { accountId } = createAwsSchemas({ regions: ctx.regions })
  return Joi.object({
    accountId: accountId.required(),
  }).unknown(true)
}

const deleteAccountAlias = async (
  ctx: OrganizationContext,
  io: DeleteAccountAliasIO,
  input: DeleteAccountAliasInput,
): Promise<DeleteAccountAliasOutput> => {
  const { timer, accountId } = input

  if (!ctx.autoConfirmEnabled) {
    if ((await io.confirmDeleteAlias(accountId)) !== ConfirmResult.YES) {
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
  const result = await deleteAccountAliasInternal(ctx, io, accountId, roleName)

  if (!result.isOk()) {
    io.error("Failed to delete account alias", result.error)
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

export const deleteAccountAliasCommand: CommandHandler<
  OrganizationConfigRepository,
  DeleteAccountAliasIO,
  DeleteAccountAliasInput,
  DeleteAccountAliasOutput
> = async ({
  ctx,
  input,
  configRepository,
  io,
  credentialManager,
}): Promise<DeleteAccountAliasOutput> =>
  validateInput(inputSchema(ctx), input)
    .then(() =>
      buildOrganizationContext(ctx, configRepository, io, credentialManager),
    )
    .then((ctx) => deleteAccountAlias(ctx, io, input))
    .then(io.printOutput)
