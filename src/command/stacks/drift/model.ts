import {
  CloudFormationStackSummary,
  StackDriftDetectionStatusOutput,
} from "../../../aws/cloudformation/model.js"
import { InternalStandardStack } from "../../../stacks/standard-stack.js"
import {
  CommandInput,
  CommandOutput,
  IO,
} from "../../../takomo-core/command.js"
import { CommandPath } from "../../command-model.js"

export interface StackDriftInfo {
  readonly current?: CloudFormationStackSummary
  readonly stack: InternalStandardStack
  readonly driftDetectionStatus?: StackDriftDetectionStatusOutput
}

export interface DetectDriftInput extends CommandInput {
  readonly commandPath: CommandPath
}

export interface DetectDriftOutput extends CommandOutput {
  readonly stacks: ReadonlyArray<StackDriftInfo>
}

export type DetectDriftIO = IO<DetectDriftOutput>
