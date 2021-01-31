import { AccountId } from "@takomo/aws-model"
import { ConfirmResult } from "@takomo/core"
import {
  CreateAccountAliasIO,
  CreateAccountAliasOutput,
} from "@takomo/organization-commands"
import { createBaseIO } from "../../cli-io"
import { IOProps } from "../../stacks/common"

export const createCreateAccountAliasIO = (
  props: IOProps,
): CreateAccountAliasIO => {
  const { logger } = props
  const io = createBaseIO(props)

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
