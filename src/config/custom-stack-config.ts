import { CustomStackType } from "../stacks/stack.js"
import { BaseStackConfig } from "./stack-config.js"

export type CustomStackConfig = BaseStackConfig & {
  readonly stackType: "custom"
  readonly customType: CustomStackType
  readonly customConfig?: unknown
}

export const isCustomStackConfig = (
  obj: BaseStackConfig,
): obj is CustomStackConfig =>
  obj !== undefined &&
  obj !== null &&
  typeof obj === "object" &&
  "customType" in obj &&
  obj.customType !== undefined
