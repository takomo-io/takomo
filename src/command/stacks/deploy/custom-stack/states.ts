import {
  CloudFormationStack,
  StackEvent,
} from "../../../../aws/cloudformation/model.js"
import { InternalStacksContext } from "../../../../context/stacks-context.js"
import {
  CustomStackChange,
  CustomStackHandler,
  CustomStackState,
} from "../../../../custom-stacks/custom-stack-handler.js"
import { InternalCustomStack } from "../../../../stacks/custom-stack.js"
import { CommandStatus } from "../../../../takomo-core/command.js"
import { TkmLogger } from "../../../../utils/logging.js"
import {
  StackOperationType,
  StackOperationVariables,
  StackResult,
} from "../../../command-model.js"
import { InitialStackOperationState } from "../../common/states.js"
import { DeployStacksIO, DeployState } from "../model.js"
import { DeployCustomStackTransitions } from "./transitions.js"

export interface InitialDeployCustomStackState
  extends InitialStackOperationState {
  readonly stack: InternalCustomStack
  readonly io: DeployStacksIO
  readonly ctx: InternalStacksContext
  readonly variables: StackOperationVariables
  readonly logger: TkmLogger
  readonly currentStatus: CustomStackState
  readonly dependencies: ReadonlyArray<Promise<StackResult>>
  readonly operationType: StackOperationType
  readonly state: DeployState
  readonly transitions: DeployCustomStackTransitions
  readonly customStackHandler: CustomStackHandler<any, any>
  readonly emit: boolean
  readonly expectNoChanges: boolean
}

export interface ParametersHolder extends InitialDeployCustomStackState {
  readonly parameters: Record<string, string>
}

export interface TagsHolder extends ParametersHolder {
  readonly tags: Record<string, string>
}

export interface ChangesHolder extends TagsHolder {
  readonly changes: ReadonlyArray<CustomStackChange>
}

export interface StackOperationResultHolder
  extends InitialDeployCustomStackState {
  readonly message: string
  readonly success: boolean
  readonly status: CommandStatus
  readonly events: ReadonlyArray<StackEvent>
  readonly stackAfterOperation?: CloudFormationStack
  readonly error?: Error
}
