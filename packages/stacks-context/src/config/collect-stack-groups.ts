import { StackGroupPath } from "@takomo/core"
import { StackGroup } from "@takomo/stacks-model"

export const collectStackGroups = (
  stackGroup: StackGroup,
  stackGroups: Map<StackGroupPath, StackGroup> = new Map(),
): Map<StackGroupPath, StackGroup> => {
  stackGroups.set(stackGroup.getPath(), stackGroup)
  stackGroup
    .getChildren()
    .forEach((child) => collectStackGroups(child, stackGroups))
  return stackGroups
}
