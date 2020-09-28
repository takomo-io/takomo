import { StackGroupPath } from "@takomo/core"
import { Stack, StackGroup } from "@takomo/stacks-model"

export const collectStacks = (
  stackGroups: Map<StackGroupPath, StackGroup>,
): Stack[] =>
  Array.from(stackGroups.values()).reduce(
    (collected, stackGroup) => [...collected, ...stackGroup.getStacks()],
    new Array<Stack>(),
  )
