import { CredentialManager } from "@takomo/aws-clients"
import { StackName } from "@takomo/aws-model"
import {
  InternalStack,
  ROOT_STACK_GROUP_PATH,
  StackGroup,
  StackGroupName,
  StackGroupPath,
  StackPath,
} from "@takomo/stacks-model"
import { createConsoleLogger } from "@takomo/util"
import { mock } from "jest-mock-extended"

export interface TestStackGroupProps {
  name: StackGroupName
  path: StackGroupPath
  stacks?: InternalStack[]
  children?: StackGroup[]
}

export const createStackGroup = (props: TestStackGroupProps): StackGroup => {
  return {
    name: props.name,
    path: props.path,
    root: props.path === ROOT_STACK_GROUP_PATH,
    stacks: props.stacks || [],
    children: props.children || [],
    regions: ["us-east-1"],
    accountIds: [],
    tags: new Map(),
    hooks: [],
    data: {},
    capabilities: [],
    ignore: false,
    terminationProtection: false,
    toProps: jest.fn(),
  }
}

export interface TestStackProps {
  path: StackPath
  name: StackName
  dependencies?: StackPath[]
  dependants?: StackPath[]
}

export const createStack = (props: TestStackProps): InternalStack => {
  return {
    path: props.path,
    name: props.name,
    dependencies: props.dependencies ?? [],
    dependants: props.dependants ?? [],
    template: "",
    region: "us-east-1",
    accountIds: [],
    tags: new Map(),
    timeout: {
      create: 0,
      update: 0,
    },
    parameters: new Map(),
    data: {},
    hooks: [],
    capabilities: [],
    ignore: false,
    terminationProtection: false,
    logger: createConsoleLogger({
      logLevel: "info",
    }),
    stackGroupPath: "/",
    getCloudFormationClient: jest.fn(),
    toProps: () => ({
      ignore: false,
      terminationProtection: false,
      timeout: {
        create: 0,
        update: 0,
      },
      stackGroupPath: "/",
      path: props.path,
      parameters: new Map(),
      logger: createConsoleLogger({
        logLevel: "info",
      }),
      dependencies: props.dependencies ?? [],
      dependants: props.dependants ?? [],
      region: "us-east-1",
      accountIds: [],
      tags: new Map(),
      template: "",
      data: {},
      hooks: [],
      name: props.name,
      credentialManager: mock<CredentialManager>(),
    }),
    credentialManager: mock<CredentialManager>(),
    getCurrentCloudFormationStack: jest.fn(),
  }
}
