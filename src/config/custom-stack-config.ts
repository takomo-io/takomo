import { CustomStackType } from "../stacks/custom-stack.js"
import { StackConfig } from "./stack-config.js"

export interface CustomStackConfig extends StackConfig {
  readonly type: CustomStackType
}

export const isCustomStackConfig = (
  config: StackConfig,
): config is CustomStackConfig =>
  (config as CustomStackConfig).type !== undefined
