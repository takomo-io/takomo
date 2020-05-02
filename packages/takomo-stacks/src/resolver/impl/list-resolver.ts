import { IamRoleArn, StackPath } from "@takomo/core"
import flatten from "lodash.flatten"
import { Resolver, ResolverExecutor, ResolverInput } from "../model"

export class ListResolver implements Resolver {
  private readonly resolvers: ResolverExecutor[]

  constructor(resolvers: ResolverExecutor[]) {
    this.resolvers = resolvers
  }

  isConfidential = (): boolean => false

  getDependencies = (): StackPath[] =>
    flatten(this.resolvers.map((r) => r.getDependencies()))

  getIamRoleArns = (): IamRoleArn[] =>
    flatten(this.resolvers.map((r) => r.getIamRoleArns()))

  resolve = async (input: ResolverInput): Promise<any> =>
    Promise.all(
      this.resolvers.map(async (resolver, index) =>
        resolver.resolve({ ...input, listParameterIndex: index }),
      ),
    )
}
