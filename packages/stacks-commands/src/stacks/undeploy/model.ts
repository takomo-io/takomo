import { StackEvent } from "@takomo/aws-model"
import { IO } from "@takomo/core"
import { CommandPath, Stack, StackGroup, StackPath } from "@takomo/stacks-model"
import { StacksOperationOutput } from "../../model"
import { StacksUndeployPlan } from "./plan"

export type ConfirmUndeployAnswer = "CANCEL" | "CONTINUE"

export interface UndeployStacksListener {
  readonly onStackUndeployBegin: (stack: Stack) => Promise<void>
  readonly onStackUndeployComplete: (stack: Stack) => Promise<void>
}

export interface UndeployStacksIO
  extends IO<StacksOperationOutput>,
    UndeployStacksListener {
  readonly chooseCommandPath: (
    rootStackGroup: StackGroup,
  ) => Promise<CommandPath>
  readonly confirmUndeploy: (
    plan: StacksUndeployPlan,
  ) => Promise<ConfirmUndeployAnswer>
  readonly printStackEvent: (stackPath: StackPath, e: StackEvent) => void
}
