import { IamRoleArn, StackParameterKey } from "@takomo/aws-model"
import { CommandContext } from "@takomo/core"
import { TkmLogger } from "@takomo/util"
import Joi from "joi"
import { GetterOrConst } from "./common"
import { StacksContext } from "./context"
import { Stack, StackPath } from "./stack"

/**
 * Resolver name
 */
export type ResolverName = string

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
  readonly resolve: (input: ResolverInput) => Promise<any>

  /**
   * A list of stack paths of the stacks this resolver depends on.
   * The stacks will be added to the list of stacks that the stack
   * where this resolver is used depends on.
   */
  readonly dependencies?: GetterOrConst<StackPath[]>

  /**
   * A list of IAM roles needed to resolve the parameter value.
   */
  readonly iamRoleArns?: GetterOrConst<IamRoleArn[]>

  /**
   * A boolean indicating whether the resolved parameter value is confidential and
   * should be concealed from logs.
   */
  readonly confidential?: GetterOrConst<boolean>
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
   * TkmLogger instance.
   */
  readonly logger: TkmLogger
}

export interface ResolverProviderSchemaProps {
  readonly ctx: CommandContext
  readonly joi: Joi.Root
  readonly base: Joi.ObjectSchema
}

/**
 * An object used to initialize resolvers.
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
  readonly getDependencies: () => StackPath[]
  readonly getIamRoleArns: () => IamRoleArn[]
  readonly getName: () => ResolverName
}
