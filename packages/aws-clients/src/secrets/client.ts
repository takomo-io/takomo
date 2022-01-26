import { SecretsManager } from "@aws-sdk/client-secrets-manager"
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
  const { withClient } = createClient({
    ...props,
    clientConstructor: (configuration) => new SecretsManager(configuration),
  })

  const getSecretValue = ({
    secretId,
    versionStage,
    versionId,
  }: GetSecretValueProps): Promise<string> =>
    withClient((c) =>
      c
        .getSecretValue({
          SecretId: secretId,
          VersionId: versionId,
          VersionStage: versionStage,
        })
        .then((r) => r.SecretString!),
    )

  return {
    getSecretValue,
  }
}
