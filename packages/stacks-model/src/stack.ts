import {
  CloudFormationClient,
  createCloudFormationClient,
  CredentialManager,
} from "@takomo/aws-clients"
import {
  AccountId,
  CloudFormationStack,
  Region,
  StackCapability,
  StackName,
  StackParameterKey,
  TagKey,
  TagValue,
} from "@takomo/aws-model"
import { CommandRole, Project, Vars } from "@takomo/core"
import { deepFreeze, FilePath, TkmLogger } from "@takomo/util"
import { TemplateBucketConfig, TimeoutConfig } from "./common"
import { HookExecutor } from "./hook"
import { ResolverExecutor } from "./resolver"
import { StackGroupPath } from "./stack-group"

/**
 * Stack path.
 */
export type StackPath = string

/**
 * @hidden
 */
export interface Template {
  readonly dynamic: boolean
  readonly filename: FilePath
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
  capabilities?: ReadonlyArray<StackCapability>
  ignore: boolean
  terminationProtection: boolean
  logger: TkmLogger
}

export interface Stack {
  readonly project?: Project
  readonly path: StackPath
  readonly stackGroupPath: StackGroupPath
  readonly name: StackName
  readonly region: Region
  readonly dependencies: ReadonlyArray<StackPath>
  readonly dependents: ReadonlyArray<StackPath>
  readonly data: Record<string, unknown>
  readonly credentialManager: CredentialManager
  readonly logger: TkmLogger
  readonly getCloudFormationClient: () => CloudFormationClient
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
  readonly terminationProtection: boolean
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
    data,
    dependents,
    dependencies,
    hooks,
    ignore,
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
  } = props

  const getCloudFormationClient = () =>
    createCloudFormationClient({
      credentialManager,
      region,
      logger,
    })

  const getCurrentCloudFormationStack = () =>
    getCloudFormationClient().describeStack(name)

  return deepFreeze({
    accountIds,
    capabilities,
    commandRole,
    credentialManager,
    data,
    dependents,
    dependencies,
    getCloudFormationClient,
    getCurrentCloudFormationStack,
    hooks,
    ignore,
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
    toProps: () => props,
  })
}
