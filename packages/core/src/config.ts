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
}
