import { AnySchema } from "joi"
import { IamRoleArn } from "../aws/common/model.js"
import { StackPath } from "../stacks/stack.js"
import { ResolverInput, ResolverName } from "./resolver.js"

export interface ResolverExecutor {
  readonly resolve: (input: ResolverInput) => Promise<any>
  readonly isConfidential: () => boolean
  readonly isImmutable: () => boolean
  readonly getDependencies: () => ReadonlyArray<StackPath>
  readonly getIamRoleArns: () => ReadonlyArray<IamRoleArn>
  readonly getName: () => ResolverName
  readonly getSchema: () => AnySchema | undefined
}
