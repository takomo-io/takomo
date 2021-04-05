import { Region } from "@takomo/aws-model"
import { TakomoError } from "@takomo/util"
import { CommandRole } from "./command"
import { Vars } from "./variables"

/**
 * @hidden
 */
export const parseVars = (value: any): Vars => value || {}

/**
 * @hidden
 */
export const parseCommandRole = (value: any): CommandRole | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  return {
    iamRoleArn: value,
  }
}

/**
 * @hidden
 */
export const parseRegex = (
  path: string,
  pattern?: string,
): RegExp | undefined => {
  try {
    return pattern ? new RegExp(pattern) : undefined
  } catch (e) {
    throw new TakomoError(
      `Invalid regex pattern ${pattern} provided in ${path}`,
    )
  }
}

export type AccountRepositoryType = string
export interface AccountRepositoryConfig {
  readonly type: AccountRepositoryType
  readonly [key: string]: unknown
}

export interface TakomoProjectOrganizationConfig {
  readonly repository?: AccountRepositoryConfig
}

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
  readonly organization?: TakomoProjectOrganizationConfig
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
export interface InternalTakomoProjectConfig extends TakomoProjectConfig {
  readonly resolvers: ReadonlyArray<ExternalResolverConfig>
  readonly features: Features
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
