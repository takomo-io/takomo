import { AccountAlias } from "@takomo/aws-model"
import { IAM } from "aws-sdk"
import { AwsClientProps, createClient } from "../common/client"

/**
 * @hidden
 */
export interface IamClient {
  readonly createAccountAlias: (alias: AccountAlias) => Promise<boolean>
  readonly deleteAccountAlias: (alias: AccountAlias) => Promise<boolean>
  readonly describeAccountAlias: () => Promise<AccountAlias | undefined>
}

/**
 * @hidden
 */
export const createIamClient = (props: AwsClientProps): IamClient => {
  const { getClient } = createClient({
    ...props,
    clientConstructor: (configuration) => new IAM(configuration),
  })

  const createAccountAlias = (alias: AccountAlias): Promise<boolean> =>
    getClient()
      .then((c) => c.createAccountAlias({ AccountAlias: alias }).promise())
      .then(() => true)

  const deleteAccountAlias = (alias: AccountAlias): Promise<boolean> =>
    getClient()
      .then((c) => c.deleteAccountAlias({ AccountAlias: alias }).promise())
      .then(() => true)

  const describeAccountAlias = (): Promise<AccountAlias | undefined> =>
    getClient()
      .then((c) => c.listAccountAliases({}).promise())
      .then((res) =>
        res.AccountAliases.length > 0 ? res.AccountAliases[0] : undefined,
      )

  return {
    createAccountAlias,
    deleteAccountAlias,
    describeAccountAlias,
  }
}
