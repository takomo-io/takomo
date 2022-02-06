import { SecretsManager } from "@aws-sdk/client-secrets-manager"
import { InternalAwsClientProps } from "../common/client"
import { customLogger } from "../common/logger"
import { customRequestHandler } from "../common/request-handler"
import { customRetryStrategy } from "../common/retry"

interface GetSecretValueProps {
  readonly secretId: string
  readonly versionId?: string
  readonly versionStage?: string
}

/**
 * @hidden
 */
export interface SecretsClient {
  readonly getSecretValue: (props: GetSecretValueProps) => Promise<string>
}

/**
 * @hidden
 */
export const createSecretsClient = (
  props: InternalAwsClientProps,
): SecretsClient => {
  const client = new SecretsManager({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(),
    logger: customLogger(props.logger),
    requestHandler: customRequestHandler(25),
  })

  client.middlewareStack.use(props.middleware)

  const getSecretValue = ({
    secretId,
    versionStage,
    versionId,
  }: GetSecretValueProps): Promise<string> =>
    client
      .getSecretValue({
        SecretId: secretId,
        VersionId: versionId,
        VersionStage: versionStage,
      })
      .then((r) => r.SecretString!)

  return {
    getSecretValue,
  }
}
