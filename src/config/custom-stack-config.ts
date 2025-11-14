import { CustomStackType } from "../stacks/stack.js"
import { StackConfig } from "./stack-config.js"

export interface CustomStackConfig extends StackConfig {
  readonly type: CustomStackType
  readonly config?: Record<string, unknown>
}

export const isCustomStackConfig = (
  config: StackConfig,
): config is CustomStackConfig =>
  (config as CustomStackConfig).type !== undefined
