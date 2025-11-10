import {
  CloudFormationStack,
  StackEvent,
} from "../../../../aws/cloudformation/model.js"
import { InternalStacksContext } from "../../../../context/stacks-context.js"
import { InternalStandardStack } from "../../../../stacks/standard-stack.js"
import { CommandStatus } from "../../../../takomo-core/command.js"
import { TkmLogger } from "../../../../utils/logging.js"
import { StackOperationVariables, StackResult } from "../../../command-model.js"
import { InitialStackOperationState } from "../../common/states.js"
import { UndeployStacksIO } from "../model.js"
import { UndeployStackTransitions } from "./transitions.js"

export interface InitialUndeployStandardStackState
  extends InitialStackOperationState {
  readonly ctx: InternalStacksContext
  readonly logger: TkmLogger
  readonly dependents: ReadonlyArray<Promise<StackResult>>
  readonly io: UndeployStacksIO
  readonly variables: StackOperationVariables
  readonly transitions: UndeployStackTransitions
  readonly stack: InternalStandardStack
  readonly currentStack?: CloudFormationStack
}

export interface CurrentStackHolder extends InitialUndeployStandardStackState {
  readonly currentStack: CloudFormationStack
}

export interface ClientTokenHolder extends CurrentStackHolder {
  readonly clientToken: string
}

export interface StackOperationResultHolder
  extends InitialUndeployStandardStackState {
  readonly message: string
  readonly events: ReadonlyArray<StackEvent>
  readonly success: boolean
  readonly status: CommandStatus
  readonly error?: Error
}
