import { TakomoError } from "@takomo/util"
import { OrganizationContext } from "../../../context"
import { loadData } from "./load"
import {
  AccountsOperationInput,
  AccountsOperationIO,
  AccountsOperationOutput,
} from "./model"

export const deployAccounts = async (
  ctx: OrganizationContext,
  io: AccountsOperationIO,
  input: AccountsOperationInput,
): Promise<AccountsOperationOutput> => {
  const { watch, organizationalUnits } = input

  if (organizationalUnits.length > 0) {
    organizationalUnits.forEach((ouPath) => {
      if (!ctx.hasOrganizationalUnit(ouPath)) {
        throw new TakomoError(`Organizational unit '${ouPath}' not found`)
      }
    })
  }

  return loadData({
    ctx,
    watch,
    io,
    input,
  })
}
