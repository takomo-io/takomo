import { StackEvent } from "../../../aws/cloudformation/model.js"
import { StackGroup } from "../../../stacks/stack-group.js"
import { StackPath } from "../../../stacks/stack.js"
import { IO } from "../../../takomo-core/command.js"
import { CommandPath } from "../../command-model.js"
import { StacksOperationListener } from "../common/model.js"
import { StacksOperationOutput } from "../model.js"
import { StacksUndeployPlan } from "./plan.js"

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
