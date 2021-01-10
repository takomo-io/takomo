import { createStackGroup, StackGroup } from "@takomo/stacks-model"
import { StackGroupConfigNode } from "./config-tree"

export const createStackGroupFromParent = (
  node: StackGroupConfigNode,
  parent: StackGroup,
): StackGroup =>
  createStackGroup({
    name: node.name,
    regions: parent.regions,
    commandRole: parent.commandRole,
    project: parent.project,
    timeout: parent.timeout,
    templateBucket: parent.templateBucket,
    tags: parent.tags,
    path: node.path,
    parentPath: parent.path,
    children: [],
    stacks: [],
    data: parent.data,
    hooks: parent.hooks,
    capabilities: parent.capabilities,
    accountIds: parent.accountIds,
    ignore: parent.ignore,
    terminationProtection: parent.terminationProtection,
  })
