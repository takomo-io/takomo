import { join } from "path"
import { Region } from "../aws/common/model"
import { TakomoError } from "../utils/errors"
import { expandFilePath, FilePath } from "../utils/files"

export type DeploymentTargetRepositoryType = string
export interface DeploymentTargetRepositoryConfig {
  readonly type: DeploymentTargetRepositoryType
  readonly [key: string]: unknown
}

export interface TakomoProjectDeploymentTargetsConfig {
  readonly repository?: ReadonlyArray<DeploymentTargetRepositoryConfig>
}

/**
 * Feature flags.
 */
export interface Features {
  /**
   * Enable deployment targets undeploy command
   */
  readonly deploymentTargetsUndeploy: boolean
}

export const defaultFeatures = (): Features => ({
  deploymentTargetsUndeploy: true,
})

export const defaultEsbuild = (projectDir: FilePath): EsbuildConfig => ({
  enabled: true,
  entryPoint: expandFilePath(projectDir, "takomo.ts"),
  outFile: expandFilePath(projectDir, join(".takomo", "out", "takomo.js")),
})

/**
 * Takomo project configuration.
 */
export interface TakomoProjectConfig {
  readonly requiredVersion?: string
  readonly deploymentTargets?: TakomoProjectDeploymentTargetsConfig
  readonly regions: ReadonlyArray<Region>
}

export interface ExternalResolverConfig {
  readonly name?: string
  readonly package: string
}

export interface ExternalHandlebarsHelperConfig {
  readonly name?: string
  readonly package: string
}

export interface EsbuildConfig {
  readonly enabled: boolean
  readonly outFile: FilePath
  readonly entryPoint: FilePath
}

export type TemplateEngineType = "handlebars" | "ejs"

export interface InternalTakomoProjectConfig extends TakomoProjectConfig {
  readonly resolvers: ReadonlyArray<ExternalResolverConfig>
  readonly helpers: ReadonlyArray<ExternalHandlebarsHelperConfig>
  readonly features: Features
  readonly varFiles: ReadonlyArray<FilePath>
  readonly helpersDir: ReadonlyArray<FilePath>
  readonly partialsDir: ReadonlyArray<FilePath>
  readonly schemasDir: ReadonlyArray<FilePath>
  readonly esbuild: EsbuildConfig
  readonly templateEngine: TemplateEngineType
}

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
