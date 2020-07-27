import Joi from "@hapi/joi"
import { accountId } from "@takomo/core"
import { buildOrganizationContext } from "@takomo/organization-context"
import { organizationalUnitPath } from "@takomo/organization-schema"
import { validateInput } from "@takomo/util"
import { deployAccounts } from "./deploy-accounts"
import {
  AccountsOperationInput,
  AccountsOperationIO,
  AccountsOperationOutput,
} from "./model"

const schema = Joi.object({
  organizationalUnits: Joi.array().items(organizationalUnitPath).unique(),
  accountIds: Joi.array().items(accountId).unique(),
}).unknown(true)

export const accountsOperationCommand = async (
  input: AccountsOperationInput,
  io: AccountsOperationIO,
): Promise<AccountsOperationOutput> =>
  validateInput(schema, input)
    .then(({ options, variables }) =>
      buildOrganizationContext(options, variables, io),
    )
    .then((ctx) => deployAccounts(ctx, io, input))
    .then(io.printOutput)
