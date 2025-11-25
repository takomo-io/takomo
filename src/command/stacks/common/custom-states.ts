import { StackEvent } from "../../../aws/cloudformation/model.js"
import { InternalCustomStack } from "../../../stacks/custom-stack.js"
import { CommandStatus } from "../../../takomo-core/command.js"
import { Timer } from "../../../utils/timer.js"
import { StackOperationType } from "../../command-model.js"
import { StacksOperationListener } from "./model.js"
import { StackOperationTransitions } from "./transitions.js"

export interface InitialCustomStackOperationState {
  readonly stack: InternalCustomStack
  readonly stackExistedBeforeOperation: boolean
  readonly operationType: StackOperationType
  readonly totalTimer: Timer
  readonly transitions: StackOperationTransitions
  readonly stacksOperationListener: StacksOperationListener
}

export interface StackOperationFailedState
  extends InitialCustomStackOperationState {
  readonly message: string
  readonly events: ReadonlyArray<StackEvent>
  readonly error?: Error
}

export interface StackOperationSkippedState
  extends InitialCustomStackOperationState {
  readonly message: string
}

export interface StackOperationCancelledState
  extends InitialCustomStackOperationState {
  readonly message: string
}

export interface StackOperationCompletedState
  extends InitialCustomStackOperationState {
  readonly message: string
  readonly success: boolean
  readonly status: CommandStatus
  readonly events: ReadonlyArray<StackEvent>
  readonly error?: Error
}
