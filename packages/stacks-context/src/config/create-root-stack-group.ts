import {
  createStackGroup,
  InternalStack,
  ROOT_STACK_GROUP_PATH,
  StackGroup,
} from "@takomo/stacks-model"

export const createRootStackGroup = (): StackGroup =>
  createStackGroup({
    name: ROOT_STACK_GROUP_PATH,
    regions: [],
    tags: new Map(),
    path: ROOT_STACK_GROUP_PATH,
    children: new Array<StackGroup>(),
    stacks: new Array<InternalStack>(),
    data: {},
    hooks: [],
    accountIds: [],
    ignore: false,
    terminationProtection: false,
  })
