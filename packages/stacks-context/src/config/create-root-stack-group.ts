import { Constants } from "@takomo/core"
import { Stack, StackGroup } from "@takomo/stacks-model"

export const createRootStackGroup = (): StackGroup =>
  new StackGroup({
    name: Constants.ROOT_STACK_GROUP_PATH,
    isRoot: true,
    regions: [],
    commandRole: null,
    project: null,
    timeout: null,
    templateBucket: null,
    tags: new Map(),
    path: Constants.ROOT_STACK_GROUP_PATH,
    parentPath: null,
    children: new Array<StackGroup>(),
    stacks: new Array<Stack>(),
    data: {},
    hooks: [],
    capabilities: null,
    accountIds: [],
    ignore: false,
    terminationProtection: false,
  })
