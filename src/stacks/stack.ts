import { AwsCredentialIdentity } from "@aws-sdk/types"
import { StackName, StackParameterKey } from "../aws/cloudformation/model.js"
import {
  CredentialManager,
  InternalCredentialManager,
} from "../aws/common/credentials.js"
import { AccountId, Region, TagKey } from "../aws/common/model.js"
import { TimeoutConfig, Vars } from "../common/model.js"
import { HookExecutor } from "../hooks/hook-executor.js"
import { ResolverExecutor } from "../resolvers/resolver-executor.js"
import { CommandRole, Project } from "../takomo-core/command.js"
import { Schemas } from "../takomo-stacks-model/schemas.js"
import { TkmLogger } from "../utils/logging.js"
import { StackGroupName, StackGroupPath } from "./stack-group.js"
import { ROOT_STACK_GROUP_PATH } from "../takomo-stacks-model/constants.js"

/**
 * Stack path.
 */
export type StackPath = string

export type RawTagValue = string | number | boolean

export interface StackProps {
  project?: Project
  path: StackPath
  stackGroupPath: StackGroupPath
  name: StackName
  region: Region
  accountIds: ReadonlyArray<AccountId>
  commandRole?: CommandRole
  tags: Map<TagKey, RawTagValue>
  timeout: TimeoutConfig
  parameters: Map<StackParameterKey, ResolverExecutor>
  dependencies: ReadonlyArray<StackPath>
  dependents: ReadonlyArray<StackPath>
  data: Vars
  hooks: ReadonlyArray<HookExecutor>
  credentialManager: InternalCredentialManager
  ignore: boolean
  obsolete: boolean
  terminationProtection: boolean
  logger: TkmLogger
  schemas?: Schemas
}

/**
 * An interface representing a stack configuration.
 */
export interface Stack {
  /**
   * Project of the stack
   */
  readonly project?: Project

  /**
   * Path of the stack
   */
  readonly path: StackPath

  /**
   * Path of the stack group where the stack belongs to
   */
  readonly stackGroupPath: StackGroupPath

  /**
   * Name of the stack
   */
  readonly name: StackName

  /**
   * Region where the stack is deployed
   */
  readonly region: Region

  /**
   * Other stacks that the stack depends on
   */
  readonly dependencies: ReadonlyArray<StackPath>

  /**
   * Other stacks that depend on the stack
   */
  readonly dependents: ReadonlyArray<StackPath>

  /**
   * Data associated with the stack
   */
  readonly data: Record<string, unknown>

  /**
   * Credential manager holding credentials associated with the stack
   */
  readonly credentialManager: CredentialManager

  /**
   * Credentials associated with the stack
   */
  readonly getCredentials: () => Promise<AwsCredentialIdentity>

  /**
   * Logger instance associated with the stack
   */
  readonly logger: TkmLogger
}

export interface InternalStack extends Stack {
  readonly accountIds: ReadonlyArray<AccountId>
  readonly commandRole?: CommandRole
  readonly tags: Map<TagKey, RawTagValue>
  readonly timeout: TimeoutConfig
  readonly parameters: Map<StackParameterKey, ResolverExecutor>
  readonly hooks: ReadonlyArray<HookExecutor>
  readonly ignore: boolean
  readonly obsolete: boolean
  readonly terminationProtection: boolean
  readonly schemas?: Schemas
  readonly credentialManager: InternalCredentialManager
}

const normalizeStackPathInternal = (
  stackPath: StackPath,
  parentPathParts: ReadonlyArray<StackGroupName>,
  [firstStackPathPart, ...restStackPathParts]: ReadonlyArray<StackPath>,
): StackPath => {
  if (firstStackPathPart !== "..") {
    return `/${[
      ...parentPathParts,
      firstStackPathPart,
      ...restStackPathParts,
    ].join("/")}`
  }

  if (parentPathParts.length === 0) {
    throw new Error(`Invalid relative stack path '${stackPath}'`)
  }

  return normalizeStackPathInternal(
    stackPath,
    parentPathParts.slice(0, -1),
    restStackPathParts,
  )
}

export const normalizeStackPath = (
  parentPath: StackGroupPath,
  stackPath: StackPath,
): StackPath => {
  if (stackPath.startsWith("/")) {
    return stackPath
  }

  if (!stackPath.startsWith("../")) {
    return parentPath === ROOT_STACK_GROUP_PATH
      ? `/${stackPath}`
      : `${parentPath}/${stackPath}`
  }

  if (parentPath === ROOT_STACK_GROUP_PATH) {
    throw new Error(`Invalid relative stack path '${stackPath}'`)
  }

  return normalizeStackPathInternal(
    stackPath,
    parentPath.slice(1).split("/"),
    stackPath.split("/"),
  )
}
