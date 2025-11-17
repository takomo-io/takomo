import { CustomStackType } from "../stacks/stack.js"
import { STANDARD_STACK_TYPE } from "../stacks/standard-stack.js"
import { StackConfig } from "./stack-config.js"

export interface CustomStackConfig extends StackConfig {
  readonly type: CustomStackType
  readonly config?: Record<string, unknown>
}

export const isCustomStackConfig = (
  config: StackConfig,
): config is CustomStackConfig =>
  config.type !== undefined && config.type !== STANDARD_STACK_TYPE
