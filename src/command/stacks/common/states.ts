import { StackEvent } from "../../../aws/cloudformation/model.js"
import { InternalStandardStack } from "../../../stacks/standard-stack.js"
import { CommandStatus } from "../../../takomo-core/command.js"
import { Timer } from "../../../utils/timer.js"
import { StackOperationType } from "../../command-model.js"
import { StacksOperationListener } from "./model.js"
import { StackOperationTransitions } from "./transitions.js"

export interface InitialStackOperationState {
  readonly stack: InternalStandardStack
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
