import { Region } from "@takomo/core"
import { Credentials, S3 } from "aws-sdk"
import { AwsClient, AwsClientClientProps } from "./aws-client"

export class S3Client extends AwsClient<S3> {
  constructor(props: AwsClientClientProps) {
    super(props)
  }

  protected getClient = (credentials: Credentials, region: Region): S3 =>
    new S3({
      ...this.clientOptions(),
      credentials,
      region,
    })

  putObject = async (
    bucketName: string,
    key: string,
    object: string,
  ): Promise<boolean> =>
    this.withClientPromise(
      (c) =>
        c.putObject({
          Bucket: bucketName,
          Key: key,
          Body: object,
        }),
      () => true,
    )
}
