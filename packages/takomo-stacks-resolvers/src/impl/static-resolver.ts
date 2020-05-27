import { Resolver, ResolverInput } from "@takomo/stacks-model"

export class StaticResolver implements Resolver {
  private readonly value: string

  constructor(value: any) {
    this.value = `${value}`
  }

  resolve = async (input: ResolverInput): Promise<any> => this.value
}
