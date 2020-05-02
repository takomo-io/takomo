import Joi from "@hapi/joi"
import { validateInput } from "@takomo/util"
import {
  accountEmail,
  accountName,
  organizationRoleName,
} from "../../../config/schema"
import { buildOrganizationContext } from "../../../context"
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
    .then(ctx => createAccount(ctx, io, input))
    .then(io.printOutput)
