import { CommandInput, ResultsOutput } from "../takomo-core"
import { CommandPath, StackResult } from "../takomo-stacks-model"

export interface StacksOperationInput extends CommandInput {
  readonly commandPath: CommandPath
  readonly ignoreDependencies: boolean
  readonly interactive: boolean
}

export interface StacksDeployOperationInput extends StacksOperationInput {
  readonly expectNoChanges: boolean
}

export interface StacksUndeployOperationInput extends StacksOperationInput {
  readonly prune: boolean
}

export type StacksOperationOutput = ResultsOutput<StackResult>
