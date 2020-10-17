import { AccountId, ConfirmResult, Options } from "@takomo/core"
import {
  DeleteAccountAliasIO,
  DeleteAccountAliasOutput,
} from "@takomo/organization-commands"
import { LogWriter } from "@takomo/util"
import CliIO from "../../cli-io"

export class CliDeleteAccountAliasIO
  extends CliIO
  implements DeleteAccountAliasIO {
  constructor(options: Options, logWriter: LogWriter = console.log) {
    super(logWriter, options)
  }

  printOutput = (
    output: DeleteAccountAliasOutput,
  ): DeleteAccountAliasOutput => {
    return output
  }

  confirmDeleteAlias = async (accountId: AccountId): Promise<ConfirmResult> =>
    (await this.confirm(
      `Continue to delete alias from account ${accountId}?`,
      true,
    ))
      ? ConfirmResult.YES
      : ConfirmResult.NO
}
