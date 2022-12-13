import { AnySchema } from "joi"
import { StackEvent } from "../aws/cloudformation/model"
import { IamRoleArn } from "../aws/common/model"
import { CommandPath } from "../command/command-model"
import { EnvVars, Variables } from "../common/model"
import { ParameterConfig } from "../config/common-config"
import { StackConfig } from "../config/stack-config"
import { HookRegistry } from "../hooks/hook-registry"
import { Resolver, ResolverInput, ResolverName } from "../resolvers/resolver"
import { ResolverRegistry } from "../resolvers/resolver-registry"
import { BlueprintPath, InternalStack, StackPath } from "../stacks/stack"
import { CommandStatus } from "../takomo-core/command"
import { SchemaRegistry } from "../takomo-stacks-model/schemas"
import { TemplateEngine } from "../templating/template-engine"
import { TakomoError } from "../utils/errors"
import { Timer } from "../utils/timer"
import { ConfigTree } from "./config/config-tree"

export class CommandPathMatchesNoStacksError extends TakomoError {
  constructor(commandPath: CommandPath, availableStackPaths: StackPath[]) {
    const stackPaths = availableStackPaths.map((s) => `  - ${s}`).join("\n")

    super(
      `No stacks found within the given command path: ${commandPath}\n\nAvailable stack paths:\n\n${stackPaths}`,
    )
  }
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

export class SingleResolverExecutor implements ResolverExecutor {
  readonly #name: ResolverName
  readonly #resolver: Resolver
  readonly #confidential?: boolean
  readonly #immutable: boolean
  readonly #schema?: AnySchema

  constructor(
    name: ResolverName,
    resolver: Resolver,
    paramConfig: ParameterConfig,
    schema?: AnySchema,
  ) {
    this.#name = name
    this.#resolver = resolver
    this.#confidential = paramConfig.confidential
    this.#immutable = paramConfig.immutable
    this.#schema = schema
  }

  resolve = async (input: ResolverInput): Promise<any> =>
    this.#resolver.resolve(input)

  isConfidential = (): boolean => {
    if (this.#confidential === true) {
      return true
    }

    if (this.#confidential === false) {
      return false
    }

    if (this.#resolver.confidential === undefined) {
      return false
    }

    if (typeof this.#resolver.confidential === "function") {
      return this.#resolver.confidential()
    }

    return this.#resolver.confidential
  }

  isImmutable = (): boolean => this.#immutable

  getIamRoleArns = (): IamRoleArn[] => {
    if (!this.#resolver.iamRoleArns) {
      return []
    }

    if (typeof this.#resolver.iamRoleArns === "function") {
      return this.#resolver.iamRoleArns()
    }

    return this.#resolver.iamRoleArns
  }

  getDependencies = (): StackPath[] => {
    if (!this.#resolver.dependencies) {
      return []
    }

    if (typeof this.#resolver.dependencies === "function") {
      return this.#resolver.dependencies()
    }

    return this.#resolver.dependencies
  }

  getName = (): ResolverName => this.#name

  getSchema = (): AnySchema | undefined => this.#schema
}

/**
 * Wrapper that executes parameter resolver.
 */
export class ListResolverExecutor implements ResolverExecutor {
  readonly #name: ResolverName
  readonly #resolvers: ReadonlyArray<ResolverExecutor>
  readonly #confidential?: boolean
  readonly #immutable: boolean
  readonly #schema?: AnySchema

  constructor(
    name: ResolverName,
    resolvers: ReadonlyArray<ResolverExecutor>,
    immutable: boolean,
    confidential?: boolean,
    schema?: AnySchema,
  ) {
    this.#name = name
    this.#resolvers = resolvers
    this.#immutable = immutable
    this.#confidential = confidential
    this.#schema = schema
  }

  resolve = async (input: ResolverInput): Promise<any> =>
    Promise.all(
      this.#resolvers.map(async (resolver, index) =>
        resolver.resolve({ ...input, listParameterIndex: index }),
      ),
    )

  isConfidential = (): boolean => {
    if (this.#confidential === true) {
      return true
    } else if (this.#confidential === false) {
      return false
    }

    return this.#resolvers.some((r) => r.isConfidential)
  }
  isImmutable = (): boolean => this.#immutable

  getDependencies = (): StackPath[] =>
    this.#resolvers.map((r) => r.getDependencies()).flat()

  getIamRoleArns = (): IamRoleArn[] =>
    this.#resolvers.map((r) => r.getIamRoleArns()).flat()

  getName = (): ResolverName => this.#name

  getSchema = (): AnySchema | undefined => this.#schema
}

export interface StackResult {
  readonly stack: InternalStack
  readonly message: string
  readonly status: CommandStatus
  readonly events: ReadonlyArray<StackEvent>
  readonly success: boolean
  readonly timer: Timer
  readonly error?: Error
}

/**
 * Wrapper that executes parameter resolver.
 */
export interface ResolverExecutor {
  resolve: (input: ResolverInput) => Promise<any>

  isConfidential: () => boolean

  isImmutable: () => boolean

  getDependencies: () => StackPath[]

  getIamRoleArns: () => IamRoleArn[]

  getName: () => ResolverName

  getSchema: () => AnySchema | undefined
}

export interface StacksConfigRepositoryProps {
  readonly variables: any
  readonly filename?: string
  readonly inline?: string
  readonly dynamic: boolean
}

export interface StacksConfigRepository {
  getStackTemplateContents: (
    props: StacksConfigRepositoryProps,
  ) => Promise<string>

  getBlueprint: (
    blueprint: BlueprintPath,
    variables: any,
  ) => Promise<StackConfig>

  buildConfigTree: () => Promise<ConfigTree>

  loadExtensions: (
    resolverRegistry: ResolverRegistry,
    hookRegistry: HookRegistry,
    schemaRegistry: SchemaRegistry,
  ) => Promise<void>

  templateEngine: TemplateEngine
}
