import { Region } from "@takomo/core"
import { Credentials, IAM } from "aws-sdk"
import { AwsClient, AwsClientClientProps } from "./aws-client"

export class IamClient extends AwsClient<IAM> {
  constructor(props: AwsClientClientProps) {
    super(props)
  }

  protected getClient = (credentials: Credentials, region: Region): IAM =>
    new IAM({
      ...this.clientOptions(),
      credentials,
      region,
    })

  createAccountAlias = async (alias: string): Promise<boolean> =>
    this.getAwsClient()
      .then((c) => c.createAccountAlias({ AccountAlias: alias }).promise())
      .then(() => true)

  deleteAccountAlias = async (alias: string): Promise<boolean> =>
    this.getAwsClient()
      .then((c) => c.deleteAccountAlias({ AccountAlias: alias }).promise())
      .then(() => true)

  describeAccountAlias = async (): Promise<string | null> =>
    this.getAwsClient()
      .then((c) => c.listAccountAliases({}).promise())
      .then((res) =>
        res.AccountAliases.length > 0 ? res.AccountAliases[0] : null,
      )
}
