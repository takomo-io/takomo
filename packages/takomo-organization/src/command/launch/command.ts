import Joi from "@hapi/joi"
import { validateInput } from "@takomo/util"
import { buildOrganizationContext } from "../../context"
import { launchOrganization } from "./launch-organization"
import {
  LaunchOrganizationInput,
  LaunchOrganizationIO,
  LaunchOrganizationOutput,
} from "./model"

const schema = Joi.object({}).unknown(true)

export const launchOrganizationCommand = async (
  input: LaunchOrganizationInput,
  io: LaunchOrganizationIO,
): Promise<LaunchOrganizationOutput> =>
  validateInput(schema, input)
    .then(({ options, variables }) =>
      buildOrganizationContext(options, variables, io),
    )
    .then(ctx => launchOrganization(ctx, io, input))
    .then(io.printOutput)
