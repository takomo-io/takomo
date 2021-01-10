import { CommandContext, CommandHandler } from "@takomo/core"
import { OrganizationConfigRepository } from "@takomo/organization-context"
import { createOrganizationSchemas } from "@takomo/organization-schema"
import { validateInput } from "@takomo/util"
import Joi, { AnySchema } from "joi"
import { createOrganization } from "./create-organization"
import {
  CreateOrganizationInput,
  CreateOrganizationIO,
  CreateOrganizationOutput,
} from "./model"

const inputSchema = (ctx: CommandContext): AnySchema => {
  const { featureSet } = createOrganizationSchemas({
    regions: ctx.regions,
    trustedAwsServices: ctx.organizationServicePrincipals,
  })

  return Joi.object({
    featureSet,
  }).unknown(true)
}

export const createOrganizationCommand: CommandHandler<
  OrganizationConfigRepository,
  CreateOrganizationIO,
  CreateOrganizationInput,
  CreateOrganizationOutput
> = async ({
  ctx,
  input,
  configRepository,
  io,
}): Promise<CreateOrganizationOutput> =>
  validateInput(inputSchema(ctx), input)
    .then(() => createOrganization(ctx, configRepository, input, io))
    .then(io.printOutput)
