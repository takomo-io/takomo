import { StandardStack } from "../../../stacks/standard-stack.js"
import { StackResult } from "../../command-model.js"

export interface StacksOperationListener {
  readonly onStackOperationBegin: (stack: StandardStack) => Promise<void>
  readonly onStackOperationComplete: (
    stack: StandardStack,
    result: StackResult,
  ) => Promise<void>
}

export type CustomStackState = {
  value: unknown
}
