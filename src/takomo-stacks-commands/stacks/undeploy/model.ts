import { StackEvent } from "../../../takomo-aws-model"
import { IO } from "../../../takomo-core"
import {
  CommandPath,
  StackGroup,
  StackPath,
} from "../../../takomo-stacks-model"
import { StacksOperationOutput } from "../../model"
import { StacksOperationListener } from "../common/model"
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
