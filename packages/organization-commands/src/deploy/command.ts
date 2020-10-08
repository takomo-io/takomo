import { buildOrganizationContext } from "@takomo/organization-context"
import { validateInput } from "@takomo/util"
import Joi from "joi"
import { loadData } from "./load"
import {
  DeployOrganizationInput,
  DeployOrganizationIO,
  DeployOrganizationOutput,
} from "./model"

const schema = Joi.object({}).unknown(true)

export const deployOrganizationCommand = async (
  input: DeployOrganizationInput,
  io: DeployOrganizationIO,
): Promise<DeployOrganizationOutput> =>
  validateInput(schema, input)
    .then(({ options, variables }) =>
      buildOrganizationContext(options, variables, io),
    )
    .then((ctx) => loadData(ctx, io, input))
    .then(io.printOutput)
