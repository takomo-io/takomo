import { StackEvent } from "../../../takomo-aws-model"
import { CommandStatus } from "../../../takomo-core"
import { InternalStack, StackOperationType } from "../../../takomo-stacks-model"
import { Timer } from "../../../takomo-util"
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
