import { Variables } from "../common/model"
import { InternalStack, StackPath } from "../stacks/stack"
import { StackGroupPath } from "../stacks/stack-group"
import {
  CloudFormationStack,
  StackEvent,
} from "../takomo-aws-model/cloudformation"
import { CommandStatus } from "../takomo-core/command"
import { Timer } from "../utils/timer"

/**
 * Command path.
 */
export type CommandPath = StackGroupPath | StackPath

export type DeploymentOperation = "deploy" | "undeploy"

export const defaultCapabilities = [
  "CAPABILITY_IAM",
  "CAPABILITY_NAMED_IAM",
  "CAPABILITY_AUTO_EXPAND",
]

export interface HookOutputValues {
  [hookName: string]: any
}

/**
 * A mutable copy of the current command variables during a stack operation.
 */
export interface StackOperationVariables extends Variables {
  /**
   * Hook output values
   */
  readonly hooks: HookOutputValues
}

export interface StackResult {
  readonly stack: InternalStack
  readonly message: string
  readonly status: CommandStatus
  readonly events: ReadonlyArray<StackEvent>
  readonly success: boolean
  readonly timer: Timer
  readonly operationType: StackOperationType
  readonly stackExistedBeforeOperation: boolean
  readonly stackAfterOperation?: CloudFormationStack
  readonly error?: Error
}

export type StackOperationType = "CREATE" | "RECREATE" | "UPDATE" | "DELETE"