import Joi, { AnySchema } from "joi"
import { IamRoleArn, StackParameterKey } from "../takomo-aws-model"
import { CommandContext } from "../takomo-core"
import { TkmLogger } from "../takomo-util"
import { StackOperationVariables } from "./command"
import { GetterOrConst } from "./common"
import { StacksContext } from "./context"
import { Stack, StackPath } from "./stack"

/**
 * Resolver name
 */
export type ResolverName = string

/**
 * An interface to be implemented by objects that resolve values for stack
 * parameters at deploy time.
 */
export interface Resolver {
  /**
   * Resolve the stack parameter value.
   *
   * @param input Resolver input
   * @returns Resolved parameter value
   */
  readonly resolve: (input: ResolverInput) => Promise<any>

  /**
   * An optional list of stack paths of the stacks this resolver depends on.
   *
   * The stacks are added to the list of stacks that the stack where this
   * resolver is used depends on.
   */
  readonly dependencies?: GetterOrConst<StackPath[]>

  /**
   * An optional list of IAM roles needed to resolve the parameter value.
   *
   * The credentials used to deploy the stack that uses this resolver must
   * have sufficient permissions to assume the listed IAM roles.
   */
  readonly iamRoleArns?: GetterOrConst<IamRoleArn[]>

  /**
   * An optional boolean indicating whether the resolved parameter value
   * is confidential and should be concealed from the logs.
   */
  readonly confidential?: GetterOrConst<boolean>
}

/**
 * An interface representing the input object passed to {@linkcode Resolver.resolve}
 * function when value for a stack parameter is being resolved.
 */
export interface ResolverInput {
  /**
   * The stack where the parameter whose value is being resolved belongs to.
   */
  readonly stack: Stack

  /**
   * Context object providing access to the project configuration.
   */
  readonly ctx: StacksContext

  /**
   * Name of the parameter whose value is being resolved.
   */
  readonly parameterName: StackParameterKey

  /**
   * If the parameter whose value is being resolved is of type list,
   * this will hold the index of the value in the list. The index begins
   * from 0. This will be 0 if the parameter being resolved os not list.
   */
  readonly listParameterIndex: number

  /**
   * Logger instance.
   */
  readonly logger: TkmLogger

  /**
   * A mutable copy of the current command variables during the stack operation.
   */
  readonly variables: StackOperationVariables
}

/**
 * An interface representing the input object passed to {@linkcode ResolverProvider.schema}
 * function when the resolver provider schema is constructed.
 */
export interface ResolverProviderSchemaProps {
  /**
   * Context object providing access to the project configuration.
   */
  readonly ctx: CommandContext

  /**
   * A [Joi object](https://joi.dev/api/?v=17.3.0#introduction) that can be
   * used to create validation rules.
   */
  readonly joi: Joi.Root

  /**
   * A pre-initialized [Joi object schema](https://joi.dev/api/?v=17.3.0#object)
   * for the resolver provider.
   */
  readonly base: Joi.ObjectSchema
}

/**
 * An interface to be implemented by objects that initialize {@linkcode Resolver}
 * objects.
 */
export interface ResolverProvider {
  /**
   * The name of the resolver that this provider initializes.
   */
  readonly name: ResolverName | (() => ResolverName)

  /**
   * Initialize a resolver.
   */
  readonly init: (props: any) => Promise<Resolver>

  /**
   * Create a schema used to validate properties used to initialize a new resolver.
   */
  readonly schema?: (props: ResolverProviderSchemaProps) => Joi.ObjectSchema
}

/**
 * @hidden
 */
export interface ResolverExecutor {
  readonly resolve: (input: ResolverInput) => Promise<any>
  readonly isConfidential: () => boolean
  readonly isImmutable: () => boolean
  readonly getDependencies: () => ReadonlyArray<StackPath>
  readonly getIamRoleArns: () => ReadonlyArray<IamRoleArn>
  readonly getName: () => ResolverName
  readonly getSchema: () => AnySchema | undefined
}
