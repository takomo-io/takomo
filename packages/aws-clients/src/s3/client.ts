import { S3 } from "@aws-sdk/client-s3"
import { InternalAwsClientProps } from "../common/client"
import { customLogger } from "../common/logger"
import { customRequestHandler } from "../common/request-handler"
import { customRetryStrategy } from "../common/retry"

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
export const createS3Client = (props: InternalAwsClientProps): S3Client => {
  const client = new S3({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(),
    logger: customLogger(props.logger),
    requestHandler: customRequestHandler(25),
  })

  client.middlewareStack.use(props.middleware)

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
