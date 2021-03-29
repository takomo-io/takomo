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

  const { organizationAccountWithoutId } = createOrganizationSchemas({
    regions: ctx.regions,
    trustedAwsServices: ctx.organizationServicePrincipals,
  })

  const {
    organizationRoleName,
    organizationalUnitPath,
  } = createOrganizationSchemas({
    regions: ctx.regions,
    trustedAwsServices: ctx.organizationServicePrincipals,
  })

  return Joi.object({
    name: accountName.required(),
    email: accountEmail.required(),
    roleName: organizationRoleName.required(),
    iamUserAccessToBilling: Joi.boolean(),
    alias: accountAlias,
    ou: organizationalUnitPath,
    config: organizationAccountWithoutId,
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
  credentialManager,
}): Promise<CreateAccountOutput> =>
  validateInput(inputSchema(ctx), input)
    .then(() =>
      buildOrganizationContext(ctx, configRepository, io, credentialManager),
    )
    .then((ctx) => createAccount(ctx, configRepository, io, input))
    .then(io.printOutput)
