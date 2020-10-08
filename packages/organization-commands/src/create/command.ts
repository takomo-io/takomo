import { validateInput } from "@takomo/util"
import Joi from "joi"
import { createOrganization } from "./create-organization"
import {
  CreateOrganizationInput,
  CreateOrganizationIO,
  CreateOrganizationOutput,
} from "./model"

const schema = Joi.object({
  featureSet: Joi.string().valid("ALL", "CONSOLIDATED_BILLING"),
}).unknown(true)

export const createOrganizationCommand = async (
  input: CreateOrganizationInput,
  io: CreateOrganizationIO,
): Promise<CreateOrganizationOutput> =>
  validateInput(schema, input)
    .then(() => createOrganization(input, io))
    .then(io.printOutput)
