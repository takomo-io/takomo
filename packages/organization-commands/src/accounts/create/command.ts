import { buildOrganizationContext } from "@takomo/organization-context"
import {
  accountAlias,
  accountEmail,
  accountName,
  organizationRoleName,
} from "@takomo/organization-schema"
import { validateInput } from "@takomo/util"
import Joi from "joi"
import { createAccount } from "./create-account"
import {
  CreateAccountInput,
  CreateAccountIO,
  CreateAccountOutput,
} from "./model"

const schema = Joi.object({
  name: accountName.required(),
  email: accountEmail.required(),
  roleName: organizationRoleName.required(),
  iamUserAccessToBilling: Joi.boolean(),
  alias: accountAlias,
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
