import { IamRoleArn, StackEvent } from "@takomo/aws-model"
import { CommandStatus, EnvVars, Variables } from "@takomo/core"
import { ParameterConfig } from "@takomo/stacks-config"
import { HookRegistry } from "@takomo/stacks-hooks"
import {
  CommandPath,
  InternalStack,
  Resolver,
  ResolverInput,
  ResolverName,
  SchemaRegistry,
  StackPath,
} from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import { TakomoError, TemplateEngine, Timer } from "@takomo/util"
import { AnySchema } from "joi"
import { ConfigTree } from "./config/config-tree"

/**
 * @hidden
 */
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
 * @hidden
 */
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
    } else if (this.#confidential === false) {
      return false
    }

    return getValue(false, this.#resolver.confidential)
  }

  isImmutable = (): boolean => this.#immutable

  getIamRoleArns = (): IamRoleArn[] => getValue([], this.#resolver.iamRoleArns)

  getDependencies = (): StackPath[] => getValue([], this.#resolver.dependencies)

  getName = (): ResolverName => this.#name

  getSchema = (): AnySchema | undefined => this.#schema
}

/**
 * Wrapper that executes parameter resolver.
 * @hidden
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
 * @hidden
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

  buildConfigTree: () => Promise<ConfigTree>

  loadExtensions: (
    resolverRegistry: ResolverRegistry,
    hookRegistry: HookRegistry,
    schemaRegistry: SchemaRegistry,
  ) => Promise<void>

  templateEngine: TemplateEngine
}
