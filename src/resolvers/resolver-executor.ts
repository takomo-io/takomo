import { AnySchema } from "joi"
import { StackPath } from "../stacks/stack"
import { IamRoleArn } from "../takomo-aws-model"
import { ResolverInput, ResolverName } from "./resolver"

export interface ResolverExecutor {
  readonly resolve: (input: ResolverInput) => Promise<any>
  readonly isConfidential: () => boolean
  readonly isImmutable: () => boolean
  readonly getDependencies: () => ReadonlyArray<StackPath>
  readonly getIamRoleArns: () => ReadonlyArray<IamRoleArn>
  readonly getName: () => ResolverName
  readonly getSchema: () => AnySchema | undefined
}
