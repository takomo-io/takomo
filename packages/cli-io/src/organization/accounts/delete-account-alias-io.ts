import { AccountId } from "@takomo/aws-model"
import { ConfirmResult } from "@takomo/core"
import {
  DeleteAccountAliasIO,
  DeleteAccountAliasOutput,
} from "@takomo/organization-commands"
import { createBaseIO } from "../../cli-io"
import { IOProps } from "../../stacks/common"

export const createDeleteAccountAliasIO = (
  props: IOProps,
): DeleteAccountAliasIO => {
  const { logger } = props
  const io = createBaseIO(props)

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
