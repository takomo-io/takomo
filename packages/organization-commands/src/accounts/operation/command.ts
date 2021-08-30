import { createAwsSchemas } from "@takomo/aws-schema"
import { createConfigSetsSchemas } from "@takomo/config-sets"
import { CommandContext, CommandHandler } from "@takomo/core"
import {
  buildOrganizationContext,
  OrganizationConfigRepository,
} from "@takomo/organization-context"
import { createOrganizationSchemas } from "@takomo/organization-schema"
import { createStacksSchemas } from "@takomo/stacks-schema"
import { validateInput } from "@takomo/util"
import Joi, { ObjectSchema } from "joi"
import {
  AccountsOperationInput,
  AccountsOperationIO,
  AccountsOperationOutput,
} from "./model"
import { executeSteps } from "./steps"
import { createAccountsOperationTransitions } from "./transitions"

const inputSchema = ({ regions }: CommandContext): ObjectSchema => {
  const { commandPath } = createStacksSchemas({ regions })
  const { configSetName } = createConfigSetsSchemas({ regions })
  const { organizationalUnitPath } = createOrganizationSchemas({
    regions,
  })

  const { accountId } = createAwsSchemas({ regions })

  return Joi.object({
    organizationalUnits: Joi.array().items(organizationalUnitPath).unique(),
    accountIds: Joi.array().items(accountId).unique(),
    configSet: configSetName,
    commandPath,
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
