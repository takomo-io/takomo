import { StackGroup, StackGroupPath } from "../../stacks/stack-group.js"
import { InternalStandardStack } from "../../stacks/standard-stack.js"

export const collectStacks = (
  stackGroups: Map<StackGroupPath, StackGroup>,
): ReadonlyArray<InternalStandardStack> =>
  Array.from(stackGroups.values()).reduce(
    (collected, stackGroup) => [...collected, ...stackGroup.stacks],
    new Array<InternalStandardStack>(),
  )
