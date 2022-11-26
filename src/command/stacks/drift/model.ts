import {
  CloudFormationStackSummary,
  StackDriftDetectionStatusOutput,
} from "../../../takomo-aws-model"
import { CommandInput, CommandOutput, IO } from "../../../takomo-core"
import { CommandPath, InternalStack } from "../../../takomo-stacks-model"

export interface StackDriftInfo {
  readonly current?: CloudFormationStackSummary
  readonly stack: InternalStack
  readonly driftDetectionStatus?: StackDriftDetectionStatusOutput
}

export interface DetectDriftInput extends CommandInput {
  readonly commandPath: CommandPath
}

export interface DetectDriftOutput extends CommandOutput {
  readonly stacks: ReadonlyArray<StackDriftInfo>
}

export type DetectDriftIO = IO<DetectDriftOutput>
