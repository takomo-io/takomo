import { createIamClient, CredentialManager } from "@takomo/aws-clients"
import { AccountId } from "@takomo/aws-model"
import { OrganizationContext } from "@takomo/organization-context"
import { TkmLogger, uuid } from "@takomo/util"
import { Policy } from "cockatiel"
import { err, ok, Result } from "neverthrow"

const createCredentialManager = async (
  ctx: OrganizationContext,
  logger: TkmLogger,
  role: string,
): Promise<CredentialManager> => {
  const retry = Policy.handleAll().retry().delay([2000, 4000, 8000, 16000])
  return retry.execute(() =>
    ctx.credentialManager.createCredentialManagerForRole(role),
  )
}

export const createAccountAliasInternal = async (
  ctx: OrganizationContext,
  logger: TkmLogger,
  accountId: AccountId,
  roleName: string,
  alias: string,
): Promise<Result<boolean, Error>> => {
  const role = `arn:aws:iam::${accountId}:role/${roleName}`

  try {
    const credentialManager = await createCredentialManager(ctx, logger, role)

    const iam = createIamClient({
      logger,
      credentialManager,
      region: "us-east-1",
      id: uuid(),
    })

    return ok(await iam.createAccountAlias(alias))
  } catch (e) {
    return err(e)
  }
}

export const deleteAccountAliasInternal = async (
  ctx: OrganizationContext,
  logger: TkmLogger,
  accountId: AccountId,
  roleName: string,
): Promise<Result<boolean, Error>> => {
  const role = `arn:aws:iam::${accountId}:role/${roleName}`

  try {
    const credentialManager = await createCredentialManager(ctx, logger, role)

    const iam = createIamClient({
      logger,
      credentialManager,
      region: "us-east-1",
      id: uuid(),
    })

    const alias = await iam.describeAccountAlias()
    if (!alias) {
      return ok(false)
    }

    return ok(await iam.deleteAccountAlias(alias))
  } catch (e) {
    return err(e)
  }
}
