import { Region } from "@takomo/aws-model"
import { FilePath, TakomoError } from "@takomo/util"

export type DeploymentTargetRepositoryType = string
export interface DeploymentTargetRepositoryConfig {
  readonly type: DeploymentTargetRepositoryType
  readonly [key: string]: unknown
}

export interface TakomoProjectDeploymentTargetsConfig {
  readonly repository?: DeploymentTargetRepositoryConfig
}

/**
 * Feature flags.
 */
export interface Features {
  /**
   * Enable deployment targets undeploy command
   */
  readonly deploymentTargetsUndeploy: boolean
  /**
   * Enable deployment targets tear down command
   */
  readonly deploymentTargetsTearDown: boolean
}

/**
 * @hidden
 */
export const defaultFeatures = (): Features => ({
  deploymentTargetsUndeploy: true,
  deploymentTargetsTearDown: true,
})

/**
 * Takomo project configuration.
 */
export interface TakomoProjectConfig {
  readonly requiredVersion?: string
  readonly deploymentTargets?: TakomoProjectDeploymentTargetsConfig
  readonly regions: ReadonlyArray<Region>
}

/**
 * @hidden
 */
export interface ExternalResolverConfig {
  readonly name?: string
  readonly package: string
}

/**
 * @hidden
 */
export interface ExternalHandlebarsHelperConfig {
  readonly name?: string
  readonly package: string
}

/**
 * @hidden
 */
export interface InternalTakomoProjectConfig extends TakomoProjectConfig {
  readonly resolvers: ReadonlyArray<ExternalResolverConfig>
  readonly helpers: ReadonlyArray<ExternalHandlebarsHelperConfig>
  readonly features: Features
  readonly varFiles: ReadonlyArray<FilePath>
  readonly helpersDir: ReadonlyArray<FilePath>
  readonly partialsDir: ReadonlyArray<FilePath>
}

/**
 * @hidden
 */
export class FeatureDisabledError extends TakomoError {
  constructor(featureName: keyof Features) {
    super(
      `Can't execute operation because feature '${featureName}' is not enabled`,
      {
        instructions: [
          `To enable this operation, set features.${featureName} = true in the project configuration`,
        ],
      },
    )
  }
}
