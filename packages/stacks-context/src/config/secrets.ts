import { Project, StackPath } from "@takomo/core"
import {
  Secret,
  SecretConfig,
  SecretName,
  SecretsPath,
} from "@takomo/stacks-model"

export const buildSecrets = (
  secretsPath: SecretsPath,
  secrets: Map<SecretName, SecretConfig>,
): Map<SecretName, Secret> =>
  new Map(
    Array.from(secrets.entries()).map(([name, config]) => {
      const secret = {
        name,
        description: config.description,
        ssmParameterName: `${secretsPath}${name}`,
      }
      return [name, secret]
    }),
  )

export const makeSecretsPath = (
  stackPath: StackPath,
  project: Project | null,
): SecretsPath => {
  const projectPart = project ? `/${project}` : ""
  return `${projectPart}${stackPath}/`
}
