import { StackParameterKey } from "../aws/cloudformation/model.js"
import { IamRoleArn } from "../aws/common/model.js"
import { StackOperationVariables } from "../command/command-model.js"
import { StacksContext } from "../context/stacks-context.js"
import { Stack, StackPath } from "../stacks/stack.js"
import { TkmLogger } from "../utils/logging.js"

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
  readonly dependencies?: StackPath[] | (() => StackPath[])

  /**
   * An optional list of IAM roles needed to resolve the parameter value.
   *
   * The credentials used to deploy the stack that uses this resolver must
   * have sufficient permissions to assume the listed IAM roles.
   */
  readonly iamRoleArns?: IamRoleArn[] | (() => IamRoleArn[])

  /**
   * An optional boolean indicating whether the resolved parameter value
   * is confidential and should be concealed from the logs.
   */
  readonly confidential?: boolean | (() => boolean)
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
