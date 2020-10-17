import { accountId, CommandStatus, ConfirmResult } from "@takomo/core"
import {
  buildOrganizationContext,
  OrganizationContext,
} from "@takomo/organization-context"
import { accountAlias } from "@takomo/organization-schema"
import { validateInput } from "@takomo/util"
import Joi from "joi"
import { createAccountAlias } from "../common"
import { CreateAliasInput, CreateAliasIO, CreateAliasOutput } from "./model"

const schema = Joi.object({
  accountId: accountId.required(),
  alias: accountAlias,
}).unknown(true)

const createAlias = async (
  ctx: OrganizationContext,
  io: CreateAliasIO,
  input: CreateAliasInput,
): Promise<CreateAliasOutput> => {
  const { options, watch, accountId, alias } = input

  if (!options.isAutoConfirmEnabled()) {
    if ((await io.confirmCreateAlias(accountId, alias)) !== ConfirmResult.YES) {
      return {
        message: "Cancelled",
        success: false,
        status: CommandStatus.CANCELLED,
        watch: watch.stop(),
      }
    }
  }

  const roleName = ctx.getAdminRoleNameForAccount(accountId)
  const result = await createAccountAlias(ctx, io, accountId, roleName, alias)

  if (!result.success) {
    io.error("Failed to create account alias", result.error)
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

export const createAliasCommand = async (
  input: CreateAliasInput,
  io: CreateAliasIO,
): Promise<CreateAliasOutput> =>
  validateInput(schema, input)
    .then(({ options, variables }) =>
      buildOrganizationContext(options, variables, io),
    )
    .then((ctx) => createAlias(ctx, io, input))
    .then(io.printOutput)
