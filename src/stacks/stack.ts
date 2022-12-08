import { CloudFormation } from "@aws-sdk/client-cloudformation"
import { Credentials } from "@aws-sdk/types"
import {
  CloudFormationStack,
  StackCapability,
  StackName,
  StackParameterKey,
  StackPolicyBody,
} from "../aws/cloudformation/model"

import { CloudFormationClient } from "../aws/cloudformation/client"
import {
  CredentialManager,
  InternalCredentialManager,
} from "../aws/common/credentials"
import { AccountId, Region, TagKey } from "../aws/common/model"
import { TemplateBucketConfig, TimeoutConfig, Vars } from "../common/model"
import { HookExecutor } from "../hooks/hook-executor"
import { ResolverExecutor } from "../resolvers/resolver-executor"
import { CommandRole, Project } from "../takomo-core/command"
import { ROOT_STACK_GROUP_PATH } from "../takomo-stacks-model/constants"
import { Schemas } from "../takomo-stacks-model/schemas"
import { FilePath } from "../utils/files"
import { TkmLogger } from "../utils/logging"
import { StackGroupName, StackGroupPath } from "./stack-group"

export type RawTagValue = string | number | boolean

/**
 * Stack path.
 */
export type StackPath = string

/**
 * Blueprint path.
 */
export type BlueprintPath = string

export interface Template {
  readonly dynamic: boolean
  readonly filename?: FilePath
  readonly inline?: string
}

export interface StackProps {
  project?: Project
  path: StackPath
  stackGroupPath: StackGroupPath
  name: StackName
  template: Template
  templateBucket?: TemplateBucketConfig
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
  capabilities?: ReadonlyArray<StackCapability>
  ignore: boolean
  obsolete: boolean
  terminationProtection: boolean
  logger: TkmLogger
  getCloudFormationClient: () => Promise<CloudFormationClient>
  stackPolicy?: StackPolicyBody
  stackPolicyDuringUpdate?: StackPolicyBody
  schemas?: Schemas
}

/**
 * An interface representing a CloudFormation stack configuration.
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
  readonly getCredentials: () => Promise<Credentials>

  /**
   * Logger instance associated with the stack
   */
  readonly logger: TkmLogger

  /**
   * Get CloudFormation client
   */
  readonly getClient: () => Promise<CloudFormation>

  /**
   * Get current CloudFormation stack
   */
  readonly getCurrentCloudFormationStack: () => Promise<
    CloudFormationStack | undefined
  >
}

export interface InternalStack extends Stack {
  readonly template: Template
  readonly templateBucket?: TemplateBucketConfig
  readonly accountIds: ReadonlyArray<AccountId>
  readonly commandRole?: CommandRole
  readonly tags: Map<TagKey, RawTagValue>
  readonly timeout: TimeoutConfig
  readonly parameters: Map<StackParameterKey, ResolverExecutor>
  readonly hooks: ReadonlyArray<HookExecutor>
  readonly capabilities?: ReadonlyArray<StackCapability>
  readonly ignore: boolean
  readonly obsolete: boolean
  readonly terminationProtection: boolean
  readonly stackPolicy?: StackPolicyBody
  readonly stackPolicyDuringUpdate?: StackPolicyBody
  readonly schemas?: Schemas
  readonly getCloudFormationClient: () => Promise<CloudFormationClient>
  readonly credentialManager: InternalCredentialManager
  readonly toProps: () => StackProps
}

export const createStack = (props: StackProps): InternalStack => {
  const {
    accountIds,
    capabilities,
    commandRole,
    credentialManager,
    data,
    dependents,
    dependencies,
    hooks,
    ignore,
    obsolete,
    logger,
    name,
    parameters,
    path,
    project,
    region,
    stackGroupPath,
    tags,
    template,
    templateBucket,
    terminationProtection,
    timeout,
    getCloudFormationClient,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
  } = props

  const getClient = async () =>
    getCloudFormationClient().then((c) => c.getNativeClient())

  const getCurrentCloudFormationStack = () =>
    getCloudFormationClient().then((c) => c.describeStack(name))

  const getCredentials = () => credentialManager.getCredentials()

  return {
    accountIds,
    capabilities,
    commandRole,
    getCredentials,
    credentialManager,
    data,
    dependents,
    dependencies,
    getClient,
    getCloudFormationClient,
    getCurrentCloudFormationStack,
    hooks,
    ignore,
    obsolete,
    logger,
    name,
    parameters,
    path,
    project,
    region,
    stackGroupPath,
    tags,
    template,
    templateBucket,
    terminationProtection,
    timeout,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
    toProps: () => props,
  }
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
    parentPath.substr(1).split("/"),
    stackPath.split("/"),
  )
}
