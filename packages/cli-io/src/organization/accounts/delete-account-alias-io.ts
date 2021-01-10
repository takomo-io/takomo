import { AccountId } from "@takomo/aws-model"
import { ConfirmResult } from "@takomo/core"
import {
  DeleteAccountAliasIO,
  DeleteAccountAliasOutput,
} from "@takomo/organization-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createBaseIO } from "../../cli-io"

export const createDeleteAccountAliasIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): DeleteAccountAliasIO => {
  const io = createBaseIO(writer)

  const printOutput = (
    output: DeleteAccountAliasOutput,
  ): DeleteAccountAliasOutput => {
    return output
  }

  const confirmDeleteAlias = async (
    accountId: AccountId,
  ): Promise<ConfirmResult> =>
    (await io.confirm(
      `Continue to delete alias from account ${accountId}?`,
      true,
    ))
      ? ConfirmResult.YES
      : ConfirmResult.NO

  return {
    ...logger,
    printOutput,
    confirmDeleteAlias,
  }
}
