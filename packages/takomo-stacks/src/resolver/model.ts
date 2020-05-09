import { IamRoleArn, StackPath } from "@takomo/core"
import { Logger } from "@takomo/util"
import { CommandContext } from "../context"
import { ParameterName, ResolverName, Stack } from "../model"

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
 * Parameter value resolver.
 */
export interface Resolver {
  /**
   * Resolve parameter value.
   *
   * @param input Resolver input
   * @returns Resolver parameter value
   */
  resolve: (input: ResolverInput) => Promise<any>

  /**
   * @returns Parameter resolver dependencies
   */
  dependencies?: GetterOrConst<StackPath[]>

  /**
   * @returns IAM roles needed to resolve the parameter value
   */
  iamRoleArns?: GetterOrConst<IamRoleArn[]>

  /**
   * @returns Is the parameter value confidential
   */
  confidential?: GetterOrConst<boolean>
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

    return getValue(false, this.resolver.confidential)
  }

  getDependencies = (): StackPath[] => getValue([], this.resolver.dependencies)

  getIamRoleArns = (): IamRoleArn[] => getValue([], this.resolver.iamRoleArns)

  /**
   * @returns Resolver name
   */
  getName = (): ResolverName => this.name
}
