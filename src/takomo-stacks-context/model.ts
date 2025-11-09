import { AnySchema } from "joi"
import { StackEvent } from "../aws/cloudformation/model.js"
import { IamRoleArn } from "../aws/common/model.js"
import { CommandPath } from "../command/command-model.js"
import { EnvVars, Variables } from "../common/model.js"
import { ParameterConfig } from "../config/common-config.js"
import { StackConfig } from "../config/stack-config.js"
import { HookRegistry } from "../hooks/hook-registry.js"
import { ResolverRegistry } from "../resolvers/resolver-registry.js"
import { Resolver, ResolverInput, ResolverName } from "../resolvers/resolver.js"
import {
  BlueprintPath,
  InternalStandardStack,
} from "../stacks/standard-stack.js"
import { CommandStatus } from "../takomo-core/command.js"
import { SchemaRegistry } from "../takomo-stacks-model/schemas.js"
import { TemplateEngine } from "../templating/template-engine.js"
import { TakomoError } from "../utils/errors.js"
import { Timer } from "../utils/timer.js"
import { ConfigTree } from "./config/config-tree.js"
import { StackPath } from "../stacks/stack.js"

export class CommandPathMatchesNoStacksError extends TakomoError {
  constructor(commandPath: CommandPath, availableStackPaths: StackPath[]) {
    const stackPaths = availableStackPaths.map((s) => `  - ${s}`).join("\n")

    super(
      `No stacks found within the given command path: ${commandPath}\n\nAvailable stack paths:\n\n${stackPaths}`,
    )
  }
}

interface HookOutputValues {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  readonly stack: InternalStandardStack
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (input: ResolverInput) => Promise<any>

  isConfidential: () => boolean

  isImmutable: () => boolean

  getDependencies: () => StackPath[]

  getIamRoleArns: () => IamRoleArn[]

  getName: () => ResolverName

  getSchema: () => AnySchema | undefined
}

export interface StacksConfigRepositoryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
