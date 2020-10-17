import { AccountId, ConfirmResult, Options } from "@takomo/core"
import {
  CreateAccountAliasIO,
  CreateAccountAliasOutput,
} from "@takomo/organization-commands"
import { LogWriter } from "@takomo/util"
import CliIO from "../../cli-io"

export class CliCreateAccountAliasIO
  extends CliIO
  implements CreateAccountAliasIO {
  constructor(options: Options, logWriter: LogWriter = console.log) {
    super(logWriter, options)
  }

  printOutput = (
    output: CreateAccountAliasOutput,
  ): CreateAccountAliasOutput => {
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
