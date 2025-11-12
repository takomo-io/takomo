import { CloudFormationStack, StackEvent } from "../aws/cloudformation/model.js"
import { Variables } from "../common/model.js"
import { StackGroupPath } from "../stacks/stack-group.js"
import { StackPath } from "../stacks/stack.js"
import { InternalStack } from "../stacks/stack.js"
import { CommandStatus } from "../takomo-core/command.js"
import { Timer } from "../utils/timer.js"
import { Capability } from "@aws-sdk/client-cloudformation"

/**
 * Command path.
 */
export type CommandPath = StackGroupPath | StackPath

export type DeploymentOperation = "deploy" | "undeploy"

export const defaultCapabilities: ReadonlyArray<Capability> = [
  "CAPABILITY_IAM",
  "CAPABILITY_NAMED_IAM",
  "CAPABILITY_AUTO_EXPAND",
]

export interface HookOutputValues {
  // eslint-disable-next-line
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
  readonly templateBody?: string
}

export type StackOperationType = "CREATE" | "RECREATE" | "UPDATE" | "DELETE"
