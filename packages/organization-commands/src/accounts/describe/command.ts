import { CommandStatus } from "@takomo/core"
import { buildOrganizationContext } from "@takomo/organization-context"
import { StopWatch, validateInput } from "@takomo/util"
import Joi from "joi"
import { describeAccount } from "./describe-accounts"
import {
  DescribeAccountInput,
  DescribeAccountIO,
  DescribeAccountOutput,
} from "./model"

const schema = Joi.object({}).unknown(true)

export const describeAccountCommand = async (
  input: DescribeAccountInput,
  io: DescribeAccountIO,
): Promise<DescribeAccountOutput> =>
  validateInput(schema, input)
    .then(({ options, variables }) =>
      buildOrganizationContext(options, variables, io),
    )
    .then((ctx) => describeAccount(ctx))
    .then(() => {
      return {
        success: true,
        message: "Success",
        status: CommandStatus.SUCCESS,
        watch: new StopWatch("total").stop(),
      }
    })
    .then(io.printOutput)
