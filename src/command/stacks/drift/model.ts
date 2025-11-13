import {
  CloudFormationStackSummary,
  StackDriftDetectionStatusOutput,
} from "../../../aws/cloudformation/model.js"
import { InternalStack } from "../../../stacks/stack.js"
import {
  CommandInput,
  CommandOutput,
  IO,
} from "../../../takomo-core/command.js"
import { CommandPath } from "../../command-model.js"

export interface StackDriftInfo {
  readonly current?: CloudFormationStackSummary
  readonly stack: InternalStack
  readonly driftDetectionStatus?: StackDriftDetectionStatusOutput
  readonly type: "standard" | "custom"
}

export interface DetectDriftInput extends CommandInput {
  readonly commandPath: CommandPath
}

export interface DetectDriftOutput extends CommandOutput {
  readonly stacks: ReadonlyArray<StackDriftInfo>
}

export type DetectDriftIO = IO<DetectDriftOutput>
