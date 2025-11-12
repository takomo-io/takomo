import { StackGroup, StackGroupPath } from "../../stacks/stack-group.js"
import { InternalStack } from "../../stacks/stack.js"

export const collectStacks = (
  stackGroups: Map<StackGroupPath, StackGroup>,
): ReadonlyArray<InternalStack> =>
  Array.from(stackGroups.values()).reduce(
    (collected, stackGroup) => [...collected, ...stackGroup.stacks],
    new Array<InternalStack>(),
  )
