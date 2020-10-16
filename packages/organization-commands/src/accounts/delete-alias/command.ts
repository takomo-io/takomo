import { accountId, CommandStatus, ConfirmResult } from "@takomo/core"
import {
  buildOrganizationContext,
  OrganizationContext,
} from "@takomo/organization-context"
import { validateInput } from "@takomo/util"
import Joi from "joi"
import { deleteAccountAlias } from "../common"
import { DeleteAliasInput, DeleteAliasIO, DeleteAliasOutput } from "./model"

const schema = Joi.object({
  accountId: accountId.required(),
}).unknown(true)

const deleteAlias = async (
  ctx: OrganizationContext,
  io: DeleteAliasIO,
  input: DeleteAliasInput,
): Promise<DeleteAliasOutput> => {
  const { options, watch, accountId } = input

  if (!options.isAutoConfirmEnabled()) {
    if ((await io.confirmDeleteAlias(accountId)) !== ConfirmResult.YES) {
      return {
        message: "Cancelled",
        success: false,
        status: CommandStatus.CANCELLED,
        watch: watch.stop(),
      }
    }
  }

  const roleName = ctx.getAdminRoleNameForAccount(accountId)
  const result = await deleteAccountAlias(ctx, io, accountId, roleName)

  if (!result.success) {
    io.error("Failed to delete account alias", result.error)
    return {
      message: "Failed",
      success: false,
      status: CommandStatus.FAILED,
      watch: input.watch.stop(),
    }
  }

  return {
    message: "Success",
    success: true,
    status: CommandStatus.SUCCESS,
    watch: input.watch.stop(),
  }
}

export const deleteAliasCommand = async (
  input: DeleteAliasInput,
  io: DeleteAliasIO,
): Promise<DeleteAliasOutput> =>
  validateInput(schema, input)
    .then(({ options, variables }) =>
      buildOrganizationContext(options, variables, io),
    )
    .then((ctx) => deleteAlias(ctx, io, input))
    .then(io.printOutput)
