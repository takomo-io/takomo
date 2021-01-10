import { AccountId } from "@takomo/aws-model"
import { ConfirmResult } from "@takomo/core"
import {
  CreateAccountAliasIO,
  CreateAccountAliasOutput,
} from "@takomo/organization-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createBaseIO } from "../../cli-io"

export const createCreateAccountAliasIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): CreateAccountAliasIO => {
  const io = createBaseIO(writer)

  const printOutput = (
    output: CreateAccountAliasOutput,
  ): CreateAccountAliasOutput => {
    return output
  }

  const confirmCreateAlias = async (
    accountId: AccountId,
    alias: string,
  ): Promise<ConfirmResult> =>
    (await io.confirm(
      `Continue to create alias '${alias}' to account ${accountId}?`,
      true,
    ))
      ? ConfirmResult.YES
      : ConfirmResult.NO

  return {
    ...logger,
    printOutput,
    confirmCreateAlias,
  }
}
