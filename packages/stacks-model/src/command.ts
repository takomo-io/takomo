import { StackEvent } from "@takomo/aws-model"
import { CommandStatus, Variables } from "@takomo/core"
import { Timer } from "@takomo/util"
import { InternalStack, StackPath } from "./stack"
import { StackGroupPath } from "./stack-group"

/**
 * Command path.
 */
export type CommandPath = StackGroupPath | StackPath

/**
 * @hidden
 */
export interface OperationState {
  failed: boolean
}

/**
 * @hidden
 */
export type DeploymentOperation = "deploy" | "undeploy"

/**
 * @hidden
 */
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

/**
 * @hidden
 */
export interface StackResult {
  readonly stack: InternalStack
  readonly message: string
  readonly status: CommandStatus
  readonly events: ReadonlyArray<StackEvent>
  readonly success: boolean
  readonly timer: Timer
  readonly error?: Error
}
