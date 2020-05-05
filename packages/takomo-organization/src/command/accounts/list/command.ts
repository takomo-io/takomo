import Joi from "@hapi/joi"
import { CommandStatus } from "@takomo/core"
import { StopWatch, validateInput } from "@takomo/util"
import { buildOrganizationContext } from "../../../context"
import { listAccounts } from "./list-accounts"
import { ListAccountsInput, ListAccountsIO, ListAccountsOutput } from "./model"

const schema = Joi.object({}).unknown(true)

export const listAccountsCommand = async (
  input: ListAccountsInput,
  io: ListAccountsIO,
): Promise<ListAccountsOutput> =>
  validateInput(schema, input)
    .then(({ options, variables }) =>
      buildOrganizationContext(options, variables, io),
    )
    .then((ctx) => listAccounts(ctx))
    .then(({ accounts, masterAccountId }) => {
      return {
        accounts,
        masterAccountId,
        success: true,
        message: "Success",
        status: CommandStatus.SUCCESS,
        watch: new StopWatch("total").stop(),
      }
    })
    .then(io.printOutput)
