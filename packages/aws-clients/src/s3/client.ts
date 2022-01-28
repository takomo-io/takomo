import { S3 } from "@aws-sdk/client-s3"
import { AwsClientProps } from "../common/client"

/**
 * @hidden
 */
export interface S3Client {
  readonly putObject: (
    bucketName: string,
    key: string,
    object: string,
  ) => Promise<boolean>
}

/**
 * @hidden
 */
export const createS3Client = (props: AwsClientProps): S3Client => {
  const client = new S3({
    region: props.region,
    credentials: props.credentialProvider,
  })

  const putObject = (
    bucketName: string,
    key: string,
    object: string,
  ): Promise<boolean> =>
    client
      .putObject({
        Bucket: bucketName,
        Key: key,
        Body: object,
      })
      .then(() => true)

  return {
    putObject,
  }
}
