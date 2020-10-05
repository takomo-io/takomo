import { Stack, StackGroup } from "@takomo/stacks-model"
import { StackGroupConfigNode } from "./tree/stack-group-config-node"

export const createStackGroupFromParent = (
  node: StackGroupConfigNode,
  parent: StackGroup,
): StackGroup =>
  new StackGroup({
    name: node.dir.basename,
    isRoot: false,
    regions: parent.getRegions(),
    commandRole: parent.getCommandRole(),
    project: parent.getProject(),
    timeout: parent.getTimeout(),
    templateBucket: parent.getTemplateBucket(),
    tags: parent.getTags(),
    path: node.path,
    parentPath: parent.getPath(),
    children: new Array<StackGroup>(),
    stacks: new Array<Stack>(),
    data: parent.getData(),
    hooks: parent.getHooks(),
    capabilities: parent.getCapabilities(),
    accountIds: parent.getAccountIds(),
    ignore: parent.isIgnored(),
    terminationProtection: parent.isTerminationProtectionEnabled(),
  })
