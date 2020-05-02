import { OrganizationContext } from "../../../context"
import { AccountsList } from "./model"

export const listAccounts = async (
  ctx: OrganizationContext,
): Promise<AccountsList> => {
  const organizationConfigFile = ctx.getOrganizationConfigFile()
  const client = ctx.getClient()

  return {
    accounts: await client.listAccounts(),
    masterAccountId: organizationConfigFile.masterAccountId,
  }
}
