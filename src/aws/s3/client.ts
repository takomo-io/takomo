import { S3 } from "@aws-sdk/client-s3"
import { InternalAwsClientProps } from "../common/client.js"
import { customRequestHandler } from "../common/request-handler.js"
import { customRetryStrategy } from "../common/retry.js"
import {
  apiRequestListenerMiddleware,
  apiRequestListenerMiddlewareOptions,
} from "../common/request-listener.js"

export interface S3Client {
  readonly putObject: (
    bucketName: string,
    key: string,
    object: string,
  ) => Promise<boolean>
}

export const createS3Client = (props: InternalAwsClientProps): S3Client => {
  const client = new S3({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(props.logger),
    requestHandler: customRequestHandler(25),
  })

  client.middlewareStack.add(
    apiRequestListenerMiddleware(props.logger, props.id, props.listener),
    apiRequestListenerMiddlewareOptions,
  )

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
