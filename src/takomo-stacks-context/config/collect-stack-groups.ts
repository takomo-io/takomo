import { StackGroup, StackGroupPath } from "../../takomo-stacks-model"

export const collectStackGroups = (
  stackGroup: StackGroup,
  stackGroups: Map<StackGroupPath, StackGroup> = new Map(),
): Map<StackGroupPath, StackGroup> => {
  stackGroups.set(stackGroup.path, stackGroup)
  stackGroup.children.forEach((child) => collectStackGroups(child, stackGroups))
  return stackGroups
}
