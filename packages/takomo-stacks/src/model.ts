import {
  AccountId,
  CommandInput,
  CommandOutput,
  CommandPath,
  CommandRole,
  CommandStatus,
  EnvVars,
  Project,
  Region,
  StackGroupName,
  StackGroupPath,
  StackName,
  StackPath,
  TakomoCredentialProvider,
  Variables,
  Vars,
} from "@takomo/core"
import { StopWatch } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { Capability } from "aws-sdk/clients/cloudformation"
import { HookConfig, HookExecutor } from "./hook/model"
import { ResolverExecutor } from "./resolver/model"

interface HookOutputValues {
  [hookName: string]: any
}

/**
 * A mutable copy of the current command variables during a stack operation.
 */
export interface StackOperationVariables extends Variables {
  /**
   * Environment variables
   */
  readonly env: EnvVars

  /**
   * Hook output values
   */
  readonly hooks: HookOutputValues
}

/**
 * Name of stack paramater
 */
export type ParameterName = string

/**
 * Name of stack tag
 */
export type TagName = string

/**
 * Value for stack tag
 */
export type TagValue = string

/**
 * Resolver name
 */
export type ResolverName = string

/**
 * Secret name
 */
export type SecretName = string

/**
 * Secret value
 */
export type SecretValue = string | null

/**
 * Path under which stack secrets are stored
 */
export type SecretsPath = string

export const defaultCapabilities = [
  "CAPABILITY_IAM",
  "CAPABILITY_NAMED_IAM",
  "CAPABILITY_AUTO_EXPAND",
]

export interface ParameterConfig {
  readonly resolver: ResolverName
  readonly confidential: boolean
}

/**
 * Template bucket configuration.
 */
export interface TemplateBucketConfig {
  /**
   * Name of the bucket.
   */
  readonly name: string

  /**
   * Key prefix under which template files are stored.
   */
  readonly keyPrefix: string | null
}

export interface SecretConfig {
  readonly name: SecretName
  readonly description: string
}

/**
 * Secret.
 */
export interface Secret {
  /**
   * Secret name
   */
  readonly name: SecretName

  /**
   * Name of the Parameter Store parameter where this secret is stored
   */
  readonly ssmParameterName: string

  /**
   * Secret description
   */
  readonly description: string
}

/**
 * Configuration for stack operation timeouts
 */
export interface TimeoutConfig {
  /**
   * Time out in minutes for stack creation
   */
  readonly create: number
  /**
   * Timeout in minutes for stack update
   */
  readonly update: number
}

export interface SecretWithValue extends Secret {
  readonly value: SecretValue
}

export interface StackGroupConfigFile {
  readonly project: Project | null
  readonly regions: Region[]
  readonly accountIds: AccountId[] | null
  readonly commandRole: CommandRole | null
  readonly templateBucket: TemplateBucketConfig | null
  readonly tags: Map<TagName, TagValue>
  readonly timeout: TimeoutConfig | null
  readonly hooks: HookConfig[]
  readonly data: Vars
  readonly ignore: boolean | null
  readonly capabilities: Capability[] | null
}

export interface StackGroupProps {
  name: StackGroupName
  project: Project | null
  regions: Region[]
  accountIds: AccountId[]
  commandRole: CommandRole | null
  path: StackGroupPath
  isRoot: boolean
  templateBucket: TemplateBucketConfig | null
  children: StackGroup[]
  stacks: Stack[]
  timeout: TimeoutConfig | null
  tags: Map<TagName, TagValue>
  hooks: HookConfig[]
  data: Vars
  capabilities: Capability[] | null
  ignore: boolean
}

export class StackGroup {
  private readonly name: StackGroupName
  private readonly project: Project | null
  private readonly regions: Region[]
  private readonly accountIds: AccountId[]
  private readonly commandRole: CommandRole | null
  private readonly path: StackGroupPath
  private readonly root: boolean
  private readonly templateBucket: TemplateBucketConfig | null
  private readonly children: StackGroup[]
  private readonly stacks: Stack[]
  private readonly timeout: TimeoutConfig | null
  private readonly tags: Map<TagName, TagValue>
  private readonly hooks: HookConfig[]
  private readonly data: Vars
  private readonly capabilities: Capability[] | null
  private readonly ignore: boolean

  constructor(props: StackGroupProps) {
    this.name = props.name
    this.project = props.project
    this.regions = props.regions
    this.accountIds = props.accountIds
    this.commandRole = props.commandRole
    this.path = props.path
    this.root = props.isRoot
    this.templateBucket = props.templateBucket
    this.children = props.children
    this.stacks = props.stacks
    this.timeout = props.timeout
    this.tags = props.tags
    this.hooks = props.hooks
    this.data = props.data
    this.capabilities = props.capabilities
    this.ignore = props.ignore
  }

  getName = (): string => this.name
  getProject = (): string | null => this.project
  getRegions = (): Region[] => [...this.regions]
  getAccountIds = (): AccountId[] => [...this.accountIds]
  getCommandRole = (): CommandRole | null => this.commandRole
  getPath = (): string => this.path
  isRoot = (): boolean => this.root
  getTemplateBucket = (): TemplateBucketConfig | null => this.templateBucket
  getChildren = (): StackGroup[] => [...this.children]
  getStacks = (): Stack[] => [...this.stacks]
  getTimeout = (): TimeoutConfig | null => this.timeout
  getTags = (): Map<TagName, TagValue> => new Map(this.tags)
  getHooks = (): HookConfig[] => [...this.hooks]
  getData = (): any => this.data
  getCapabilities = (): CloudFormation.Capability[] | null => this.capabilities
  isIgnored = (): boolean => this.ignore

  toProps = (): StackGroupProps => ({
    name: this.getName(),
    project: this.getProject(),
    regions: this.getRegions(),
    accountIds: this.getAccountIds(),
    commandRole: this.getCommandRole(),
    path: this.getPath(),
    isRoot: this.isRoot(),
    templateBucket: this.getTemplateBucket(),
    children: this.getChildren(),
    stacks: this.getStacks(),
    timeout: this.getTimeout(),
    tags: this.getTags(),
    hooks: this.getHooks(),
    data: this.getData(),
    capabilities: this.getCapabilities(),
    ignore: this.isIgnored(),
  })
}

export interface StackConfigFile {
  readonly project: Project | null
  readonly name: StackName | null
  readonly template: string | null
  readonly templateBucket: TemplateBucketConfig | null
  readonly regions: Region[]
  readonly accountIds: AccountId[] | null
  readonly commandRole: CommandRole | null
  readonly timeout: TimeoutConfig | null
  readonly depends: StackPath[]
  readonly tags: Map<TagName, TagValue>
  readonly parameters: Map<ParameterName, ParameterConfig>
  readonly data: Vars
  readonly hooks: HookConfig[]
  readonly secrets: Map<SecretName, SecretConfig>
  readonly capabilities: Capability[] | null
  readonly ignore: boolean | null
}

/**
 * Stack properties.
 */
export interface StackProps {
  /**
   * Project
   */
  project: Project | null
  /**
   * Stack path
   */
  path: StackPath

  /**
   * Stack name
   */
  name: StackName

  /**
   * Stack template
   */
  template: string

  /**
   * Template bucket configuration
   */
  templateBucket: TemplateBucketConfig | null

  /**
   * Stack region
   */
  region: Region

  /**
   * Accounts where the stack can be deployed
   */
  accountIds: AccountId[]

  /**
   * Role used to manage the stack
   */
  commandRole: CommandRole | null

  /**
   * Stack tags
   */
  tags: Map<TagName, TagValue>

  /**
   * Timeout configuration
   */
  timeout: TimeoutConfig

  /**
   * Stack parameters
   */
  parameters: Map<ParameterName, ResolverExecutor>

  /**
   * Stack dependencies
   */
  dependencies: StackPath[]
  /**
   * Stack dependants
   */
  dependants: StackPath[]

  /**
   * Stack data
   */
  data: Vars

  /**
   * Stack hooks
   */
  hooks: HookExecutor[]

  /**
   * Stack secrets
   */
  secrets: Map<SecretName, Secret>

  /**
   * Secrets path
   */
  secretsPath: SecretsPath

  /**
   * Credential provider
   */
  credentialProvider: TakomoCredentialProvider

  /**
   * Stack capabilities
   */
  capabilities: Capability[] | null

  /**
   * Is the stack ignored
   */
  ignore: boolean
}

/**
 * Stack represents a concrete CloudFormation stack.
 */
export class Stack {
  private readonly project: Project | null
  private readonly path: StackPath
  private readonly name: StackName
  private readonly template: string
  private readonly templateBucket: TemplateBucketConfig | null
  private readonly region: Region
  private readonly accountIds: AccountId[]
  private readonly commandRole: CommandRole | null
  private readonly tags: Map<TagName, TagValue>
  private readonly timeout: TimeoutConfig
  private readonly parameters: Map<ParameterName, ResolverExecutor>
  private readonly dependencies: StackPath[]
  private readonly dependants: StackPath[]
  private readonly data: any
  private readonly hooks: HookExecutor[]
  private readonly secrets: Map<SecretName, Secret>
  private readonly secretsPath: SecretsPath
  private readonly ignore: boolean
  private readonly credentialProvider: TakomoCredentialProvider
  private readonly capabilities: Capability[] | null

  /**
   * @param props Stack properties
   */
  constructor(props: StackProps) {
    this.project = props.project
    this.path = props.path
    this.name = props.name
    this.template = props.template
    this.templateBucket = props.templateBucket
    this.region = props.region
    this.accountIds = props.accountIds
    this.commandRole = props.commandRole
    this.tags = props.tags
    this.timeout = props.timeout
    this.parameters = props.parameters
    this.dependencies = props.dependencies
    this.dependants = props.dependants
    this.data = props.data
    this.hooks = props.hooks
    this.secrets = props.secrets
    this.secretsPath = props.secretsPath
    this.credentialProvider = props.credentialProvider
    this.capabilities = props.capabilities
    this.ignore = props.ignore
  }

  /**
   * @returns Project
   */
  getProject = (): Project | null => this.project

  /**
   * @returns Stack path
   */
  getPath = (): StackPath => this.path

  /**
   * @returns Stack name
   */

  getName = (): StackName => this.name

  /**
   * @returns Stack template
   */
  getTemplate = (): string => this.template
  /**
   * @returns Template bucket configuration
   */
  getTemplateBucket = (): TemplateBucketConfig | null => this.templateBucket

  /**
   * @returns Region
   */
  getRegion = (): Region => this.region

  /**
   * Returns list of accounts where this stack can be deployed
   *
   * @returns List accounts ids
   */
  getAccountIds = (): AccountId[] => [...this.accountIds]

  /**
   * Returns command role used to deploy this stack
   *
   * @returns Command role
   */
  getCommandRole = (): CommandRole | null => this.commandRole

  /**
   * @returns Stack tags
   */
  getTags = (): Map<TagName, TagValue> => new Map(this.tags)

  /**
   * @returns Timeout configuration
   */
  getTimeout = (): TimeoutConfig => this.timeout

  /**
   * @returns Stack input parameters
   */
  getParameters = (): Map<ParameterName, ResolverExecutor> =>
    new Map(this.parameters)

  /**
   * Returns stack paths of the stacks that this stack depends on.
   *
   * @returns Stacks dependencies
   */
  getDependencies = (): StackPath[] => [...this.dependencies]

  /**
   * Returns stack paths of the stacks that depend on this stack.
   *
   * @returns Stack dependants
   */
  getDependants = (): StackPath[] => [...this.dependants]

  /**
   * Returns arbitrary data attached to this stack.
   *
   * @returns Data
   */
  getData = (): any => this.data

  /**
   * Returns hook executors that execute the hooks attached to this stack.
   *
   * @returns List of hook executors
   */
  getHooks = (): HookExecutor[] => [...this.hooks]

  /**
   * @returns Secret configuration
   */
  getSecrets = (): Map<SecretName, Secret> => new Map(this.secrets)

  /**
   * @returns The path under which secrets of this stack are stored in Parameter Store
   */
  getSecretsPath = (): SecretsPath => this.secretsPath

  /**
   * Returns credential provider that provides credentials used to manage this stack.
   *
   * @returns Credential provider
   */
  getCredentialProvider = (): TakomoCredentialProvider =>
    this.credentialProvider

  /**
   * @returns Stack capabilities
   */
  getCapabilities = (): Capability[] | null => this.capabilities

  /**
   * @returns Is this stack ignored
   */
  isIgnored = (): boolean => this.ignore

  /**
   * @returns Stack properties
   */
  toProps = (): StackProps => ({
    project: this.getProject(),
    path: this.getPath(),
    name: this.getName(),
    ignore: this.isIgnored(),
    template: this.getTemplate(),
    templateBucket: this.getTemplateBucket(),
    region: this.getRegion(),
    accountIds: this.getAccountIds(),
    commandRole: this.getCommandRole(),
    tags: this.getTags(),
    timeout: this.getTimeout(),
    parameters: this.getParameters(),
    dependencies: this.getDependencies(),
    dependants: this.getDependants(),
    data: this.getData(),
    hooks: this.getHooks(),
    secrets: this.getSecrets(),
    secretsPath: this.getSecretsPath(),
    credentialProvider: this.getCredentialProvider(),
    capabilities: this.getCapabilities(),
  })
}

export interface StackSecrets {
  readonly stack: Stack
  readonly secrets: SecretWithValue[]
}

export interface StackSecretsDiff {
  readonly stack: Stack
  readonly add: Secret[]
  readonly remove: Secret[]
}

export interface StackResult {
  readonly stack: Stack
  readonly message: string
  readonly status: CommandStatus
  readonly reason: StackResultReason
  readonly events: CloudFormation.StackEvent[]
  readonly success: boolean
  readonly watch: StopWatch
}

export type StackResultReason = string

export interface StacksOperationInput extends CommandInput {
  readonly commandPath: CommandPath
  readonly ignoreDependencies: boolean
  readonly interactive: boolean
}

export interface StacksOperationOutput extends CommandOutput {
  readonly results: StackResult[]
}
