import { createAwsSchemas } from "@takomo/aws-schema"
import { CommandContext, CommandHandler } from "@takomo/core"
import {
  buildOrganizationContext,
  OrganizationConfigRepository,
} from "@takomo/organization-context"
import { createOrganizationSchemas } from "@takomo/organization-schema"
import { validateInput } from "@takomo/util"
import Joi from "joi"
import { createAccount } from "./create-account"
import {
  CreateAccountInput,
  CreateAccountIO,
  CreateAccountOutput,
} from "./model"

const inputSchema = (ctx: CommandContext) => {
  const { accountName, accountEmail, accountAlias } = createAwsSchemas({
    regions: ctx.regions,
  })

  const { organizationRoleName } = createOrganizationSchemas({
    regions: ctx.regions,
    trustedAwsServices: ctx.organizationServicePrincipals,
  })

  return Joi.object({
    name: accountName.required(),
    email: accountEmail.required(),
    roleName: organizationRoleName.required(),
    iamUserAccessToBilling: Joi.boolean(),
    alias: accountAlias,
  }).unknown(true)
}

export const createAccountCommand: CommandHandler<
  OrganizationConfigRepository,
  CreateAccountIO,
  CreateAccountInput,
  CreateAccountOutput
> = async ({
  ctx,
  input,
  configRepository,
  io,
}): Promise<CreateAccountOutput> =>
  validateInput(inputSchema(ctx), input)
    .then((input) => buildOrganizationContext(ctx, configRepository, io))
    .then((ctx) => createAccount(ctx, io, input))
    .then(io.printOutput)
