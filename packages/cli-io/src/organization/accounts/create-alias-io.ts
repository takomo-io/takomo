import { AccountId, ConfirmResult, Options } from "@takomo/core"
import { CreateAliasIO, CreateAliasOutput } from "@takomo/organization-commands"
import { LogWriter } from "@takomo/util"
import CliIO from "../../cli-io"

export class CliCreateAliasIO extends CliIO implements CreateAliasIO {
  constructor(options: Options, logWriter: LogWriter = console.log) {
    super(logWriter, options)
  }

  printOutput = (output: CreateAliasOutput): CreateAliasOutput => {
    return output
  }

  confirmCreateAlias = async (
    accountId: AccountId,
    alias: string,
  ): Promise<ConfirmResult> =>
    (await this.confirm(
      `Continue to create alias '${alias}' to account ${accountId}?`,
      true,
    ))
      ? ConfirmResult.YES
      : ConfirmResult.NO
}
