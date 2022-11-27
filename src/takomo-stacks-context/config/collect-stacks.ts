import { InternalStack } from "../../stacks/stack"
import { StackGroup, StackGroupPath } from "../../stacks/stack-group"

export const collectStacks = (
  stackGroups: Map<StackGroupPath, StackGroup>,
): ReadonlyArray<InternalStack> =>
  Array.from(stackGroups.values()).reduce(
    (collected, stackGroup) => [...collected, ...stackGroup.stacks],
    new Array<InternalStack>(),
  )
