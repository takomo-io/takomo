import {
  CloudFormationStackSummary,
  StackDriftDetectionStatusOutput,
} from "../../../aws/cloudformation/model"
import { InternalStack } from "../../../stacks/stack"
import { CommandInput, CommandOutput, IO } from "../../../takomo-core/command"
import { CommandPath } from "../../command-model"

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
