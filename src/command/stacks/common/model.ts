import { Stack } from "../../../stacks/stack.js"
import { StackResult } from "../../command-model.js"

export interface StacksOperationListener {
  readonly onStackOperationBegin: (stack: Stack) => Promise<void>
  readonly onStackOperationComplete: (
    stack: Stack,
    result: StackResult,
  ) => Promise<void>
}
