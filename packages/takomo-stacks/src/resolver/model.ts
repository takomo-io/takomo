import { IamRoleArn, StackPath } from "@takomo/core"
import { Logger } from "@takomo/util"
import { CommandContext } from "../context"
import { ParameterName, ResolverName, Stack } from "../model"

/**
 * Parameter value resolver.
 */
export interface Resolver {
  /**
   * Resolve parameter name.
   *
   * @param input Resolver input
   * @returns Resolver parameter value
   */
  resolve(input: ResolverInput): Promise<any>

  /**
   * @returns Parameter resolver dependencies
   */
  getDependencies(): StackPath[]

  /**
   * @returns IAM roles needed to resolve the parameter value
   */
  getIamRoleArns(): IamRoleArn[]

  /**
   * @returns Is the parameter value confidential
   */
  isConfidential(): boolean
}

export type ResolverInitializer = (props: any) => Promise<Resolver>
export type ResolverInitializersMap = Map<ResolverName, ResolverInitializer>

export interface ResolverInput {
  readonly stack: Stack
  readonly ctx: CommandContext
  readonly parameterName: ParameterName
  readonly listParameterIndex: number
  readonly logger: Logger
}

/**
 * Wrapper that executes parameter resolver.
 */
export class ResolverExecutor implements Resolver {
  private readonly name: ResolverName
  private readonly resolver: Resolver
  private readonly overrideConfidential: boolean | undefined

  constructor(name: ResolverName, resolver: Resolver, paramConfig: any) {
    this.name = name
    this.resolver = resolver
    this.overrideConfidential = paramConfig.confidential
  }

  resolve = async (input: ResolverInput): Promise<any> =>
    this.resolver.resolve(input)

  isConfidential = (): boolean => {
    if (this.overrideConfidential === true) {
      return true
    } else if (this.overrideConfidential === false) {
      return false
    }

    return this.resolver.isConfidential ? this.resolver.isConfidential() : false
  }

  getDependencies = (): StackPath[] =>
    this.resolver.getDependencies ? this.resolver.getDependencies() : []

  getIamRoleArns = (): IamRoleArn[] =>
    this.resolver.getIamRoleArns ? this.resolver.getIamRoleArns() : []

  /**
   * @returns Resolver name
   */
  getName = (): ResolverName => this.name
}
