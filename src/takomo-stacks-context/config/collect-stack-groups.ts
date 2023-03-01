import { StackGroup, StackGroupPath } from "../../stacks/stack-group.js"

export const collectStackGroups = (
  stackGroup: StackGroup,
  stackGroups: Map<StackGroupPath, StackGroup> = new Map(),
): Map<StackGroupPath, StackGroup> => {
  stackGroups.set(stackGroup.path, stackGroup)
  stackGroup.children.forEach((child) => collectStackGroups(child, stackGroups))
  return stackGroups
}
