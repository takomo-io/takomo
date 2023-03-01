import { createStackGroup, StackGroup } from "../../stacks/stack-group.js"
import { deepCopy } from "../../utils/objects.js"
import { StackGroupConfigNode } from "./config-tree.js"

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
    tags: new Map(parent.tags),
    path: node.path,
    parentPath: parent.path,
    children: [],
    stacks: [],
    data: deepCopy(parent.data),
    hooks: parent.hooks,
    capabilities: parent.capabilities,
    accountIds: parent.accountIds,
    ignore: parent.ignore,
    obsolete: parent.obsolete,
    terminationProtection: parent.terminationProtection,
    stackPolicy: parent.stackPolicy,
    stackPolicyDuringUpdate: parent.stackPolicyDuringUpdate,
    schemas: parent.schemas,
  })
