import { createStackGroup, StackGroup } from "../../takomo-stacks-model"
import { deepCopy } from "../../takomo-util"
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
