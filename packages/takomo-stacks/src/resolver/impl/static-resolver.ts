import { IamRoleArn, StackPath } from "@takomo/core"
import { Resolver, ResolverInput } from "../model"

export class StaticResolver implements Resolver {
  private readonly value: string

  constructor(value: any) {
    this.value = `${value}`
  }

  isConfidential = (): boolean => false

  getDependencies = (): StackPath[] => []

  getIamRoleArns = (): IamRoleArn[] => []

  resolve = async (input: ResolverInput): Promise<any> => this.value
}
