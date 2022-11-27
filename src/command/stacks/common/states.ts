import { InternalStack } from "../../../stacks/stack"
import { StackEvent } from "../../../takomo-aws-model/cloudformation"
import { CommandStatus } from "../../../takomo-core/command"
import { Timer } from "../../../utils/timer"
import { StackOperationType } from "../../command-model"
import { StacksOperationListener } from "./model"
import { StackOperationTransitions } from "./transitions"

export interface InitialStackOperationState {
  readonly stack: InternalStack
  readonly stackExistedBeforeOperation: boolean
  readonly operationType: StackOperationType
  readonly totalTimer: Timer
  readonly transitions: StackOperationTransitions
  readonly stacksOperationListener: StacksOperationListener
}

export interface StackOperationFailedState extends InitialStackOperationState {
  readonly message: string
  readonly events: ReadonlyArray<StackEvent>
  readonly error?: Error
}

export interface StackOperationSkippedState extends InitialStackOperationState {
  readonly message: string
}

export interface StackOperationCancelledState
  extends InitialStackOperationState {
  readonly message: string
}

export interface StackOperationCompletedState
  extends InitialStackOperationState {
  readonly message: string
  readonly success: boolean
  readonly status: CommandStatus
  readonly events: ReadonlyArray<StackEvent>
  readonly error?: Error
}
