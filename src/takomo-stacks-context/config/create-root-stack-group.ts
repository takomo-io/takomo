import { createStackGroup, StackGroup } from "../../stacks/stack-group.js"
import { InternalStandardStack } from "../../stacks/standard-stack.js"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants.js"

export const createRootStackGroup = (): StackGroup =>
  createStackGroup({
    name: ROOT_STACK_GROUP_PATH,
    regions: [],
    tags: new Map(),
    path: ROOT_STACK_GROUP_PATH,
    children: new Array<StackGroup>(),
    stacks: new Array<InternalStandardStack>(),
    data: {},
    hooks: [],
    accountIds: [],
    ignore: false,
    obsolete: false,
    terminationProtection: false,
  })
