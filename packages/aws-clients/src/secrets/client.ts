import { SecretsManager } from "@aws-sdk/client-secrets-manager"
import { AwsClientProps } from "../common/client"

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
  const client = new SecretsManager({
    region: props.region,
    credentials: props.credentialProvider,
  })

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
