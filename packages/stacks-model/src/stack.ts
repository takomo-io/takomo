import { CloudFormationClient, CredentialManager } from "@takomo/aws-clients"
import {
  AccountId,
  CloudFormationStack,
  Region,
  StackCapability,
  StackName,
  StackParameterKey,
  StackPolicyBody,
  TagKey,
  TagValue,
} from "@takomo/aws-model"
import { CommandRole, Project, Vars } from "@takomo/core"
import { FilePath, TkmLogger } from "@takomo/util"
import { Credentials } from "aws-sdk"
import { TemplateBucketConfig, TimeoutConfig } from "./common"
import { ROOT_STACK_GROUP_PATH } from "./constants"
import { HookExecutor } from "./hook"
import { ResolverExecutor } from "./resolver"
import { Schemas } from "./schemas"
import { StackGroupName, StackGroupPath } from "./stack-group"

/**
 * Stack path.
 */
export type StackPath = string

/**
 * @hidden
 */
export interface Template {
  readonly dynamic: boolean
  readonly filename?: FilePath
  readonly inline?: string
}

/**
 * @hidden
 */
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
  tags: Map<TagKey, TagValue>
  timeout: TimeoutConfig
  parameters: Map<StackParameterKey, ResolverExecutor>
  dependencies: ReadonlyArray<StackPath>
  dependents: ReadonlyArray<StackPath>
  data: Vars
  hooks: ReadonlyArray<HookExecutor>
  credentialManager: CredentialManager
  credentials: Credentials
  capabilities?: ReadonlyArray<StackCapability>
  ignore: boolean
  obsolete: boolean
  terminationProtection: boolean
  logger: TkmLogger
  cloudFormationClient: CloudFormationClient
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
  readonly credentials: Credentials

  /**
   * Logger instance associated with the stack
   */
  readonly logger: TkmLogger

  /**
   * Returns a client that can be used to invoke CloudFormation API using the
   * credentials associated with the stack.
   */
  readonly getCloudFormationClient: () => CloudFormationClient

  /**
   * Returns the current CloudFormation stack matching the stack
   */
  readonly getCurrentCloudFormationStack: () => Promise<
    CloudFormationStack | undefined
  >
}

/**
 * @hidden
 */
export interface InternalStack extends Stack {
  readonly template: Template
  readonly templateBucket?: TemplateBucketConfig
  readonly accountIds: ReadonlyArray<AccountId>
  readonly commandRole?: CommandRole
  readonly tags: Map<TagKey, TagValue>
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
  readonly toProps: () => StackProps
}

/**
 * @hidden
 */
export const createStack = (props: StackProps): InternalStack => {
  const {
    accountIds,
    capabilities,
    commandRole,
    credentialManager,
    credentials,
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
    cloudFormationClient,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
  } = props

  const getCloudFormationClient = () => cloudFormationClient

  const getCurrentCloudFormationStack = () =>
    getCloudFormationClient().describeStack(name)

  return {
    accountIds,
    capabilities,
    commandRole,
    credentials,
    credentialManager,
    data,
    dependents,
    dependencies,
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

/**
 * @hidden
 */
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
