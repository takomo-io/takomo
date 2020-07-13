import { IamRoleArn, StackPath } from "@takomo/core"
import { Resolver, ResolverExecutor, ResolverInput } from "@takomo/stacks-model"
import flatten from "lodash.flatten"

export class ListResolver implements Resolver {
  private readonly resolvers: ResolverExecutor[]

  constructor(resolvers: ResolverExecutor[]) {
    this.resolvers = resolvers
  }

  dependencies = (): StackPath[] =>
    flatten(this.resolvers.map((r) => r.getDependencies()))

  iamRoleArns = (): IamRoleArn[] =>
    flatten(this.resolvers.map((r) => r.getIamRoleArns()))

  resolve = async (input: ResolverInput): Promise<any> =>
    Promise.all(
      this.resolvers.map(async (resolver, index) =>
        resolver.resolve({ ...input, listParameterIndex: index }),
      ),
    )
}
