import Joi from "@hapi/joi"
import { validateInput } from "@takomo/util"
import { buildOrganizationContext } from "../../context"
import { describeOrganization } from "./describe-organization"
import {
  DescribeOrganizationInput,
  DescribeOrganizationIO,
  DescribeOrganizationOutput,
} from "./model"

const schema = Joi.object({}).unknown(true)

export const describeOrganizationCommand = async (
  input: DescribeOrganizationInput,
  io: DescribeOrganizationIO,
): Promise<DescribeOrganizationOutput> =>
  validateInput(schema, input)
    .then(({ options, variables }) =>
      buildOrganizationContext(options, variables, io),
    )
    .then((ctx) => describeOrganization(ctx, io))
    .then(io.printOutput)
