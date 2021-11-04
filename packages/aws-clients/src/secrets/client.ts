import { SecretsManager } from "aws-sdk"
import { AwsClientProps, createClient } from "../common/client"

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
export const createSecretsClient = (props: AwsClientProps): SecretsClient => {
  const { withClientPromise } = createClient({
    ...props,
    clientConstructor: (configuration) => new SecretsManager(configuration),
  })

  const getSecretValue = ({
    secretId,
    versionStage,
    versionId,
  }: GetSecretValueProps): Promise<string> =>
    withClientPromise(
      (c) =>
        c.getSecretValue({
          SecretId: secretId,
          VersionId: versionId,
          VersionStage: versionStage,
        }),
      (r) => r.SecretString!,
    )

  return {
    getSecretValue,
  }
}
