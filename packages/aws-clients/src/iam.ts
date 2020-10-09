import { AwsClient, AwsClientClientProps } from "./aws-client"
import { Credentials, IAM } from "aws-sdk"
import { Region } from "@takomo/core"

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
}
