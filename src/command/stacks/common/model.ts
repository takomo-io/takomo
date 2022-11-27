import { Stack } from "../../../stacks/stack"
import { StackResult } from "../../command-model"

export interface StacksOperationListener {
  readonly onStackOperationBegin: (stack: Stack) => Promise<void>
  readonly onStackOperationComplete: (
    stack: Stack,
    result: StackResult,
  ) => Promise<void>
}
