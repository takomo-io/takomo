import { InternalStack, StackGroup, StackGroupPath } from "@takomo/stacks-model"

export const collectStacks = (
  stackGroups: Map<StackGroupPath, StackGroup>,
): ReadonlyArray<InternalStack> =>
  Array.from(stackGroups.values()).reduce(
    (collected, stackGroup) => [...collected, ...stackGroup.stacks],
    new Array<InternalStack>(),
  )
