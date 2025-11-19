import { CustomStackType } from "../stacks/stack.js"
import { StackConfig } from "./stack-config.js"

export interface CustomStackConfig extends StackConfig {
  readonly customType: CustomStackType
  readonly customConfig?: unknown
}

export const isCustomStackConfig = (
  obj: StackConfig,
): obj is CustomStackConfig =>
  obj !== undefined &&
  obj !== null &&
  typeof obj === "object" &&
  "customType" in obj &&
  obj.customType !== undefined
