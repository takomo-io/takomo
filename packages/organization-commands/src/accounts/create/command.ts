import Joi from "@hapi/joi"
import { buildOrganizationContext } from "@takomo/organization-context"
import {
  accountEmail,
  accountName,
  organizationRoleName,
} from "@takomo/organization-schema"
import { validateInput } from "@takomo/util"
import { createAccount } from "./create-account"
import {
  CreateAccountInput,
  CreateAccountIO,
  CreateAccountOutput,
} from "./model"

const schema = Joi.object({
  name: accountName,
  email: accountEmail,
  roleName: organizationRoleName,
  iamUserAccessToBilling: Joi.boolean(),
}).unknown(true)

export const createAccountCommand = async (
  input: CreateAccountInput,
  io: CreateAccountIO,
): Promise<CreateAccountOutput> =>
  validateInput(schema, input)
    .then(({ options, variables }) =>
      buildOrganizationContext(options, variables, io),
    )
    .then((ctx) => createAccount(ctx, io, input))
    .then(io.printOutput)
