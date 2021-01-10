import { S3 } from "aws-sdk"
import { AwsClientProps, createClient } from "../common/client"

/**
 * @hidden
 */
export interface S3Client {
  putObject: (
    bucketName: string,
    key: string,
    object: string,
  ) => Promise<boolean>
}

/**
 * @hidden
 */
export const createS3Client = (props: AwsClientProps): S3Client => {
  const { withClientPromise } = createClient({
    ...props,
    clientConstructor: (config) => new S3(config),
  })

  const putObject = (
    bucketName: string,
    key: string,
    object: string,
  ): Promise<boolean> =>
    withClientPromise(
      (c) =>
        c.putObject({
          Bucket: bucketName,
          Key: key,
          Body: object,
        }),
      () => true,
    )

  return {
    putObject,
  }
}
