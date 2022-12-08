import { StackEvent } from "../../../aws/cloudformation/model"
import { StackPath } from "../../../stacks/stack"
import { StackGroup } from "../../../stacks/stack-group"
import { IO } from "../../../takomo-core/command"
import { CommandPath } from "../../command-model"
import { StacksOperationListener } from "../common/model"
import { StacksOperationOutput } from "../model"
import { StacksUndeployPlan } from "./plan"

export type ConfirmUndeployAnswer = "CANCEL" | "CONTINUE"

export interface UndeployStacksIO extends IO<StacksOperationOutput> {
  readonly chooseCommandPath: (
    rootStackGroup: StackGroup,
  ) => Promise<CommandPath>
  readonly confirmUndeploy: (
    plan: StacksUndeployPlan,
  ) => Promise<ConfirmUndeployAnswer>
  readonly printStackEvent: (stackPath: StackPath, e: StackEvent) => void
  readonly createStacksOperationListener: (
    stackCount: number,
  ) => StacksOperationListener
}
