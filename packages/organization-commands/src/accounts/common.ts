import { IamClient } from "@takomo/aws-clients"
import { AccountId, TakomoCredentialProvider } from "@takomo/core"
import { OrganizationContext } from "@takomo/organization-context"
import { Failure, Logger, Result, Success } from "@takomo/util"
import { Policy } from "cockatiel"

const createCredentialProvider = async (
  ctx: OrganizationContext,
  logger: Logger,
  role: string,
): Promise<TakomoCredentialProvider> => {
  const retry = Policy.handleAll().retry().delay([2000, 4000, 8000, 16000])
  return retry.execute(() =>
    ctx.getCredentialProvider().createCredentialProviderForRole(role),
  )
}

export const createAccountAlias = async (
  ctx: OrganizationContext,
  logger: Logger,
  accountId: AccountId,
  roleName: string,
  alias: string,
): Promise<Result<Error, boolean>> => {
  const role = `arn:aws:iam::${accountId}:role/${roleName}`

  try {
    const credentialProvider = await createCredentialProvider(ctx, logger, role)

    const iam = new IamClient({
      logger,
      credentialProvider,
      region: "us-east-1",
    })

    return Success.of(await iam.createAccountAlias(alias))
  } catch (e) {
    return Failure.of(e)
  }
}

export const deleteAccountAlias = async (
  ctx: OrganizationContext,
  logger: Logger,
  accountId: AccountId,
  roleName: string,
): Promise<Result<Error, boolean>> => {
  const role = `arn:aws:iam::${accountId}:role/${roleName}`

  try {
    const credentialProvider = await createCredentialProvider(ctx, logger, role)

    const iam = new IamClient({
      logger,
      credentialProvider,
      region: "us-east-1",
    })

    const alias = await iam.describeAccountAlias()
    if (alias === null) {
      return Success.of(false)
    }

    return Success.of(await iam.deleteAccountAlias(alias))
  } catch (e) {
    return Failure.of(e)
  }
}
