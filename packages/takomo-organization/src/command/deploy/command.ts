import Joi from "@hapi/joi"
import { validateInput } from "@takomo/util"
import { buildOrganizationContext } from "../../context"
import { deployOrganization } from "./launch-organization"
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
    .then((ctx) => deployOrganization(ctx, io, input))
    .then(io.printOutput)
