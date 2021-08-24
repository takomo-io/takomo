import { Stack, StackResult } from "@takomo/stacks-model"

export interface StacksOperationListener {
  readonly onStackOperationBegin: (stack: Stack) => Promise<void>
  readonly onStackOperationComplete: (
    stack: Stack,
    result: StackResult,
  ) => Promise<void>
}
