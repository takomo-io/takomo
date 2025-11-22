import { StackEvent } from "../../../../aws/cloudformation/model.js"
import { InternalStacksContext } from "../../../../context/stacks-context.js"
import { CustomStackHandler } from "../../../../custom-stack-handler/custom-stack-handler.js"
import { InternalCustomStack } from "../../../../stacks/custom-stack.js"
import { CommandStatus } from "../../../../takomo-core/command.js"
import { TkmLogger } from "../../../../utils/logging.js"
import { StackOperationVariables, StackResult } from "../../../command-model.js"
import { InitialStackOperationState } from "../../common/states.js"
import { UndeployStacksIO } from "../model.js"
import { UndeployCustomStackTransitions } from "./transitions.js"

export interface InitialUndeployCustomStackState
  extends InitialStackOperationState {
  readonly ctx: InternalStacksContext
  readonly logger: TkmLogger
  readonly dependents: ReadonlyArray<Promise<StackResult>>
  readonly io: UndeployStacksIO
  readonly variables: StackOperationVariables
  readonly transitions: UndeployCustomStackTransitions
  readonly stack: InternalCustomStack
  readonly customStackHandler: CustomStackHandler<any, any>
  readonly customConfig: unknown
  readonly currentState?: unknown
}

export interface StackOperationResultHolder
  extends InitialUndeployCustomStackState {
  readonly message: string
  readonly events: ReadonlyArray<StackEvent>
  readonly success: boolean
  readonly status: CommandStatus
  readonly error?: Error
}
