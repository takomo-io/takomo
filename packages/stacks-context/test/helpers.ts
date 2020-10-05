import {
  Constants,
  StackGroupName,
  StackGroupPath,
  StackName,
  StackPath,
} from "@takomo/core"
import { Stack, StackGroup } from "@takomo/stacks-model"
import { ConsoleLogger } from "@takomo/util"

export interface TestStackGroupProps {
  name: StackGroupName
  path: StackGroupPath
  stacks?: Stack[]
  children?: StackGroup[]
}

export const createStackGroup = (props: TestStackGroupProps): StackGroup =>
  new StackGroup({
    name: props.name,
    path: props.path,
    parentPath: null,
    isRoot: props.path === Constants.ROOT_STACK_GROUP_PATH,
    stacks: props.stacks || [],
    children: props.children || [],
    project: null,
    regions: ["us-east-1"],
    accountIds: [],
    commandRole: null,
    templateBucket: null,
    timeout: null,
    tags: new Map(),
    hooks: [],
    data: {},
    capabilities: [],
    ignore: false,
    terminationProtection: false,
  })

export interface TestStackProps {
  path: StackPath
  name: StackName
  dependencies?: StackPath[]
  dependants?: StackPath[]
}

export const createStack = (props: TestStackProps): Stack => {
  return new Stack({
    logger: new ConsoleLogger(),
    path: props.path,
    stackGroupPath: "",
    name: props.name,
    dependencies: props.dependencies || [],
    dependants: props.dependants || [],
    project: null,
    template: "",
    templateBucket: null,
    region: "us-east-1",
    accountIds: [],
    commandRole: null,
    tags: new Map(),
    timeout: {
      create: 0,
      update: 0,
    },
    parameters: new Map(),
    data: {},
    hooks: [],
    secrets: new Map(),
    secretsPath: "",
    credentialProvider: {
      getName: jest.fn(),
      createCredentialProviderForRole: jest.fn(),
      getCredentials: jest.fn(),
      getCallerIdentity: jest.fn(),
    },
    capabilities: [],
    ignore: false,
    terminationProtection: false,
  })
}

export const createStackConfig = (
  stackPath: StackPath,
  dependencies: StackPath[] = [],
): Stack =>
  new Stack({
    logger: new ConsoleLogger(),
    project: null,
    path: stackPath,
    stackGroupPath: "",
    name: "",
    template: "",
    templateBucket: null,
    region: "eu-west-1",
    accountIds: [],
    commandRole: null,
    tags: new Map(),
    timeout: {
      update: 0,
      create: 0,
    },
    parameters: new Map(),
    dependencies,
    dependants: [],
    data: {},
    hooks: [],
    secrets: new Map(),
    secretsPath: "",
    credentialProvider: {
      getName: jest.fn(),
      createCredentialProviderForRole: jest.fn(),
      getCredentials: jest.fn(),
      getCallerIdentity: jest.fn(),
    },
    capabilities: null,
    ignore: false,
    terminationProtection: false,
  })
