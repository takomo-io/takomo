import { createAwsSchemas } from "@takomo/aws-schema"
import { CommandContext, CommandHandler } from "@takomo/core"
import {
  buildOrganizationContext,
  OrganizationConfigRepository,
} from "@takomo/organization-context"
import { createOrganizationSchemas } from "@takomo/organization-schema"
import { validateInput } from "@takomo/util"
import Joi, { ObjectSchema } from "joi"
import {
  AccountsOperationInput,
  AccountsOperationIO,
  AccountsOperationOutput,
} from "./model"
import { executeSteps } from "./steps"
import { createAccountsOperationTransitions } from "./transitions"

const inputSchema = (ctx: CommandContext): ObjectSchema => {
  const { organizationalUnitPath } = createOrganizationSchemas({
    regions: ctx.regions,
    trustedAwsServices: ctx.organizationServicePrincipals,
  })

  const { accountId } = createAwsSchemas({ regions: ctx.regions })

  return Joi.object({
    organizationalUnits: Joi.array().items(organizationalUnitPath).unique(),
    accountIds: Joi.array().items(accountId).unique(),
  }).unknown(true)
}

export const accountsOperationCommand: CommandHandler<
  OrganizationConfigRepository,
  AccountsOperationIO,
  AccountsOperationInput,
  AccountsOperationOutput
> = async ({
  ctx,
  input,
  configRepository,
  io,
  credentialManager,
}): Promise<AccountsOperationOutput> =>
  validateInput(inputSchema(ctx), input)
    .then(() =>
      buildOrganizationContext(ctx, configRepository, io, credentialManager),
    )
    .then((ctx) =>
      executeSteps({
        configRepository,
        ctx,
        input,
        io,
        totalTimer: input.timer,
        transitions: createAccountsOperationTransitions(),
      }),
    )
    .then(io.printOutput)
