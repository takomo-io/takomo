import { S3 } from "@aws-sdk/client-s3"
import { AwsClientProps, createClient } from "../common/client"

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
  const { withClient } = createClient({
    ...props,
    clientConstructor: (config) => new S3(config),
  })

  const putObject = (
    bucketName: string,
    key: string,
    object: string,
  ): Promise<boolean> =>
    withClient((c) =>
      c
        .putObject({
          Bucket: bucketName,
          Key: key,
          Body: object,
        })
        .then(() => true),
    )

  return {
    putObject,
  }
}
