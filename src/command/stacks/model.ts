import { CommandInput, ResultsOutput } from "../../takomo-core/command.js"
import { CommandPath, StackResult } from "../command-model.js"

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
