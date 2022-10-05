import { CloudFormationStack, StackEvent } from "../../../takomo-aws-model"
import { CommandStatus } from "../../../takomo-core"
import {
  InternalStacksContext,
  StackOperationVariables,
  StackResult,
} from "../../../takomo-stacks-model"
import { TkmLogger } from "../../../takomo-util"
import { InitialStackOperationState } from "../common/states"
import { UndeployStacksIO } from "./model"
import { UndeployStackTransitions } from "./transitions"

export interface InitialUndeployStackState extends InitialStackOperationState {
  readonly currentStack?: CloudFormationStack
  readonly ctx: InternalStacksContext
  readonly logger: TkmLogger
  readonly dependents: ReadonlyArray<Promise<StackResult>>
  readonly io: UndeployStacksIO
  readonly variables: StackOperationVariables
  readonly transitions: UndeployStackTransitions
}

export interface CurrentStackHolder extends InitialUndeployStackState {
  readonly currentStack: CloudFormationStack
}

export interface ClientTokenHolder extends CurrentStackHolder {
  readonly clientToken: string
}

export interface StackOperationResultHolder extends InitialUndeployStackState {
  readonly message: string
  readonly events: ReadonlyArray<StackEvent>
  readonly success: boolean
  readonly status: CommandStatus
  readonly error?: Error
}
