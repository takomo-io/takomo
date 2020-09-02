import Joi from "@hapi/joi"
import { CloudFormationClient } from "@takomo/aws-clients"
import {
  AccountId,
  CommandPath,
  CommandRole,
  CommandStatus,
  EnvVars,
  IamRoleArn,
  Options,
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
import { Logger, StopWatch, TemplateEngine } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { Capability } from "aws-sdk/clients/cloudformation"

export enum StackLaunchType {
  CREATE = "CREATE",
  RECREATE = "RECREATE",
  UPDATE = "UPDATE",
}

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
 * Name of stack parameter
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
  readonly terminationProtection: boolean | null
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
  terminationProtection: boolean
}

export class StackGroup {
  readonly #name: StackGroupName
  readonly #project: Project | null
  readonly #regions: Region[]
  readonly #accountIds: AccountId[]
  readonly #commandRole: CommandRole | null
  readonly #path: StackGroupPath
  readonly #root: boolean
  readonly #templateBucket: TemplateBucketConfig | null
  readonly #children: StackGroup[]
  readonly #stacks: Stack[]
  readonly #timeout: TimeoutConfig | null
  readonly #tags: Map<TagName, TagValue>
  readonly #hooks: HookConfig[]
  readonly #data: Vars
  readonly #capabilities: Capability[] | null
  readonly #ignore: boolean
  readonly #terminationProtection: boolean

  constructor(props: StackGroupProps) {
    this.#name = props.name
    this.#project = props.project
    this.#regions = props.regions
    this.#accountIds = props.accountIds
    this.#commandRole = props.commandRole
    this.#path = props.path
    this.#root = props.isRoot
    this.#templateBucket = props.templateBucket
    this.#children = props.children
    this.#stacks = props.stacks
    this.#timeout = props.timeout
    this.#tags = props.tags
    this.#hooks = props.hooks
    this.#data = props.data
    this.#capabilities = props.capabilities
    this.#ignore = props.ignore
    this.#terminationProtection = props.terminationProtection
  }

  getName = (): string => this.#name
  getProject = (): string | null => this.#project
  getRegions = (): Region[] => [...this.#regions]
  getAccountIds = (): AccountId[] => [...this.#accountIds]
  getCommandRole = (): CommandRole | null => this.#commandRole
  getPath = (): string => this.#path
  isRoot = (): boolean => this.#root
  getTemplateBucket = (): TemplateBucketConfig | null => this.#templateBucket
  getChildren = (): StackGroup[] => [...this.#children]
  getStacks = (): Stack[] => [...this.#stacks]
  getTimeout = (): TimeoutConfig | null => this.#timeout
  getTags = (): Map<TagName, TagValue> => new Map(this.#tags)
  getHooks = (): HookConfig[] => [...this.#hooks]
  getData = (): any => this.#data
  getCapabilities = (): CloudFormation.Capability[] | null => this.#capabilities
  isIgnored = (): boolean => this.#ignore
  isTerminationProtectionEnabled = (): boolean => this.#terminationProtection

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
    terminationProtection: this.isTerminationProtectionEnabled(),
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
  readonly terminationProtection: boolean | null
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

  /**
   * Is stack termination protection enabled
   */
  terminationProtection: boolean

  /**
   * Logger instance
   */
  logger: Logger
}

/**
 * Stack representing a CloudFormation stack.
 */
export class Stack {
  readonly #project: Project | null
  readonly #path: StackPath
  readonly #name: StackName
  readonly #template: string
  readonly #templateBucket: TemplateBucketConfig | null
  readonly #region: Region
  readonly #accountIds: AccountId[]
  readonly #commandRole: CommandRole | null
  readonly #tags: Map<TagName, TagValue>
  readonly #timeout: TimeoutConfig
  readonly #parameters: Map<ParameterName, ResolverExecutor>
  readonly #dependencies: StackPath[]
  readonly #dependants: StackPath[]
  readonly #data: any
  readonly #hooks: HookExecutor[]
  readonly #secrets: Map<SecretName, Secret>
  readonly #secretsPath: SecretsPath
  readonly #ignore: boolean
  readonly #terminationProtection: boolean
  readonly #credentialProvider: TakomoCredentialProvider
  readonly #capabilities: Capability[] | null
  readonly #logger: Logger

  /**
   * @param props Stack properties
   */
  constructor(props: StackProps) {
    this.#project = props.project
    this.#path = props.path
    this.#name = props.name
    this.#template = props.template
    this.#templateBucket = props.templateBucket
    this.#region = props.region
    this.#accountIds = props.accountIds
    this.#commandRole = props.commandRole
    this.#tags = props.tags
    this.#timeout = props.timeout
    this.#parameters = props.parameters
    this.#dependencies = props.dependencies
    this.#dependants = props.dependants
    this.#data = props.data
    this.#hooks = props.hooks
    this.#secrets = props.secrets
    this.#secretsPath = props.secretsPath
    this.#credentialProvider = props.credentialProvider
    this.#capabilities = props.capabilities
    this.#ignore = props.ignore
    this.#terminationProtection = props.terminationProtection
    this.#logger = props.logger
  }

  /**
   * @returns Project
   */
  getProject = (): Project | null => this.#project

  /**
   * @returns Stack path
   */
  getPath = (): StackPath => this.#path

  /**
   * @returns Stack name
   */

  getName = (): StackName => this.#name

  /**
   * @returns Stack template
   */
  getTemplate = (): string => this.#template
  /**
   * @returns Template bucket configuration
   */
  getTemplateBucket = (): TemplateBucketConfig | null => this.#templateBucket

  /**
   * @returns Region
   */
  getRegion = (): Region => this.#region

  /**
   * Returns list of accounts where this stack can be deployed
   *
   * @returns List accounts ids
   */
  getAccountIds = (): AccountId[] => [...this.#accountIds]

  /**
   * Returns command role used to deploy this stack
   *
   * @returns Command role
   */
  getCommandRole = (): CommandRole | null => this.#commandRole

  /**
   * @returns Stack tags
   */
  getTags = (): Map<TagName, TagValue> => new Map(this.#tags)

  /**
   * @returns Timeout configuration
   */
  getTimeout = (): TimeoutConfig => this.#timeout

  /**
   * @returns Stack input parameters
   */
  getParameters = (): Map<ParameterName, ResolverExecutor> =>
    new Map(this.#parameters)

  /**
   * Returns stack paths of the stacks that this stack depends on.
   *
   * @returns Stacks dependencies
   */
  getDependencies = (): StackPath[] => [...this.#dependencies]

  /**
   * Returns stack paths of the stacks that depend on this stack.
   *
   * @returns Stack dependants
   */
  getDependants = (): StackPath[] => [...this.#dependants]

  /**
   * Returns arbitrary data attached to this stack.
   *
   * @returns Data
   */
  getData = (): any => this.#data

  /**
   * Returns hook executors that execute the hooks attached to this stack.
   *
   * @returns List of hook executors
   */
  getHooks = (): HookExecutor[] => [...this.#hooks]

  /**
   * @returns Secret configuration
   */
  getSecrets = (): Map<SecretName, Secret> => new Map(this.#secrets)

  /**
   * @returns The path under which secrets of this stack are stored in Parameter Store
   */
  getSecretsPath = (): SecretsPath => this.#secretsPath

  /**
   * Returns credential provider that provides credentials used to manage this stack.
   *
   * @returns Credential provider
   */
  getCredentialProvider = (): TakomoCredentialProvider =>
    this.#credentialProvider

  /**
   * @returns Stack capabilities
   */
  getCapabilities = (): Capability[] | null => this.#capabilities

  /**
   * @returns Is this stack ignored
   */
  isIgnored = (): boolean => this.#ignore

  /**
   * @returns Is termination protection enabled
   */
  isTerminationProtectionEnabled = (): boolean => this.#terminationProtection

  /**
   * @returns Logger instance
   */
  getLogger = (): Logger => this.#logger

  /**
   * @returns CloudFormation client that can be used to access this stack.
   */
  getCloudFormationClient = (): CloudFormationClient =>
    new CloudFormationClient({
      credentialProvider: this.getCredentialProvider(),
      region: this.getRegion(),
      logger: this.getLogger(),
    })

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
    terminationProtection: this.isTerminationProtectionEnabled(),
    logger: this.getLogger(),
  })
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

export type HookType = string

/**
 * Specifies during which stack operation the hook should be executed.
 */
export type HookOperation = "create" | "update" | "delete"

/**
 * Specifies during which stack operation stage stage the hook should be executed.
 */
export type HookStage = "before" | "after"

/**
 * Specifies after which stack operation status the hook should be executed.
 */
export type HookStatus = "success" | "failed" | "skipped" | "cancelled"

/**
 * Hook configuration.
 */
export interface HookConfig {
  /**
   * Hook name
   */
  readonly name: string
  /**
   * Hook type
   */
  readonly type: string
  /**
   * Stage when the hook should be executed
   */
  readonly stage: HookStage[] | null
  /**
   * Operation during which the hook should be executed
   */
  readonly operation: HookOperation[] | null
  /**
   * Stack operation status after which the hook should be executed
   */
  readonly status: HookStatus[] | null
}

/**
 * Input for a life-cycle hook action.
 */
export interface HookInput {
  /**
   * Context object providing access to the current command.
   */
  readonly ctx: CommandContext

  /**
   * A mutable copy of the current command variables. Can be used to share data between hooks in of the same stack.
   */

  readonly variables: StackOperationVariables

  /**
   * Stack operation stage.
   */

  readonly stage: HookStage

  /**
   * Stack operation.
   */

  readonly operation: HookOperation

  /**
   * Status of the current stack operation. Has value only when the stage is "after".
   */

  readonly status: HookStatus | null
}

/**
 * Output of a life-cycle hook action.
 */
export interface HookOutputObject {
  /**
   * Optional message describing the outcome of the action.
   */
  readonly message?: string

  /**
   * Boolean describing if the action was successful.
   */
  readonly success: boolean

  /**
   * Optional return value.
   */
  readonly value?: any
}

export type HookOutput = HookOutputObject | Error | boolean

export interface HooksExecutionOutput {
  /**
   * Message describing the outcome of the action.
   */
  readonly message: string

  /**
   * Boolean describing if the action was successful.
   */
  readonly success: boolean
}

/**
 * Life-cycle hook used to perform actions at different stages of stack deploy and uneploy commands.
 */
export interface Hook {
  /**
   * Perform the hook action.
   *
   * @param input Inputs for the action
   * @returns Action output
   */
  execute(input: HookInput): Promise<HookOutput>
}

/**
 * Wrapper that executes the hook.
 */
export class HookExecutor implements Hook {
  readonly config: HookConfig
  private readonly hook: Hook

  /**
   * @param config Hook configuration
   * @param hook Hook instance
   */
  constructor(config: HookConfig, hook: Hook) {
    this.config = config
    this.hook = hook
  }

  /**
   * @param input Hook input
   * @returns Should the hook be executed
   */
  match = (input: HookInput): boolean => {
    if (this.config.stage && !this.config.stage.includes(input.stage)) {
      return false
    }
    if (
      this.config.operation &&
      !this.config.operation.includes(input.operation)
    ) {
      return false
    }
    return !(
      input.status &&
      this.config.status &&
      !this.config.status.includes(input.status)
    )
  }

  execute = async (input: HookInput): Promise<HookOutputObject> => {
    try {
      const result = await this.hook.execute(input)
      if (typeof result === "boolean") {
        return {
          message: result ? "Success" : "Failed",
          success: result,
          value: result,
        }
      }

      if (result instanceof Error) {
        return {
          message: result.message || "Error",
          success: false,
          value: result,
        }
      }

      return result
    } catch (e) {
      return {
        message: e.message || "Error",
        success: false,
      }
    }
  }
}

export type HookInitializer = (props: any) => Promise<Hook>
export type HookInitializersMap = Map<HookType, HookInitializer>

/**
 * Type representing either a function that returns a value
 * or a constant value.
 */
type GetterOrConst<T> = () => T | T

const getValue = <T>(defaultValue: T, value?: GetterOrConst<T>): T => {
  if (value === undefined) {
    return defaultValue
  }

  if (typeof value === "function") {
    return value()
  }

  return value
}

/**
 * Parameter resolver used to resolve value for stack input parameters.
 */
export interface Resolver {
  /**
   * Resolve the parameter value.
   *
   * @param input Resolver input
   * @returns Resolver parameter value
   */
  resolve: (input: ResolverInput) => Promise<any>

  /**
   * A list of stack paths of the stacks this resolver depends on.
   * The stacks will be added to the list of stacks that the stack
   * where this resolver is used depends on.
   */
  dependencies?: GetterOrConst<StackPath[]>

  /**
   * A list of IAM roles needed to resolve the parameter value.
   */
  iamRoleArns?: GetterOrConst<IamRoleArn[]>

  /**
   * A boolean indicating whether the resolved parameter value is confidential and
   * should be concealed from logs.
   */
  confidential?: GetterOrConst<boolean>
}

/**
 * Input for resolve stack input parameter value operation.
 */
export interface ResolverInput {
  /**
   * The stack where the parameter whose value is being resolved belongs to.
   */
  readonly stack: Stack

  /**
   * Command context object providing access to configuration and stacks.
   */
  readonly ctx: CommandContext

  /**
   * Name of the parameter whose value is being resolved.
   */
  readonly parameterName: ParameterName

  /**
   * If the parameter whose value is being resolved is of type list,
   * this will hold the index of the value in the list. The index begins
   * from 0. This will be 0 if the parameter being resolved os not list.
   */
  readonly listParameterIndex: number

  /**
   * Logger instance.
   */
  readonly logger: Logger
}

export interface ResolverProvider {
  name: ResolverName | (() => ResolverName)
  init: (props: any) => Promise<Resolver>
  schema?: (joi: Joi.Root, base: Joi.ObjectSchema) => Joi.ObjectSchema
}

/**
 * Wrapper that executes parameter resolver.
 */
export class ResolverExecutor implements Resolver {
  readonly #name: ResolverName
  readonly #resolver: Resolver
  readonly #overrideConfidential: boolean | undefined

  constructor(name: ResolverName, resolver: Resolver, paramConfig: any) {
    this.#name = name
    this.#resolver = resolver
    this.#overrideConfidential = paramConfig.confidential
  }

  resolve = async (input: ResolverInput): Promise<any> =>
    this.#resolver.resolve(input)

  isConfidential = (): boolean => {
    if (this.#overrideConfidential === true) {
      return true
    } else if (this.#overrideConfidential === false) {
      return false
    }

    return getValue(false, this.#resolver.confidential)
  }

  getDependencies = (): StackPath[] => getValue([], this.#resolver.dependencies)

  getIamRoleArns = (): IamRoleArn[] => getValue([], this.#resolver.iamRoleArns)

  /**
   * @returns Resolver name
   */
  getName = (): ResolverName => this.#name
}

/**
 * Provides access to the current command.
 */
export interface CommandContext {
  /**
   * @returns Command options
   */
  getOptions(): Options

  /**
   * @returns Command variables
   */
  getVariables(): Variables

  /**
   * @returns Logger
   */
  getLogger(): Logger

  /**
   * @returns Cedential provider
   */
  getCredentialProvider(): TakomoCredentialProvider

  /**
   * @returns List of stacks to process
   */
  getStacksToProcess(): Stack[]

  /**
   * Returns list of stacks within the given command path.
   *
   * @param path Command path
   * @returns List of stacks within the given command path
   */
  getStacksByPath(path: CommandPath): Stack[]

  /**
   * Returns template engine used to render dynamic configuration and template files.
   *
   * @returns Template engine
   */
  getTemplateEngine(): TemplateEngine

  /**
   * Returns existing CloudFormation stack or null if the stack does not exists.
   * @param stackPath Stack path
   * @returns Existing CloudFormation stack or null
   */
  getExistingStack(stackPath: StackPath): Promise<CloudFormation.Stack | null>

  /**
   * Return existing CloudFormation stack template symmary or null if the stack does not exists.
   * @param stackPath Stack path
   * @returns Existing CloudFormation template summary or null
   */
  getExistingTemplateSummary(
    stackPath: StackPath,
  ): Promise<CloudFormation.GetTemplateSummaryOutput | null>

  /**
   * Remove existing stack
   * @param stackPath Stack path
   */
  removeExistingStack(stackPath: StackPath): void

  /**
   * Remove existing template summary
   * @param stackPath Stack path
   */
  removeExistingTemplateSummary(stackPath: StackPath): void
}
