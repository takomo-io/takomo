import { StackName } from "@takomo/aws-model"
import { InternalStack, StackPath } from "@takomo/stacks-model"
import { createConsoleLogger } from "@takomo/util"

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
    dependencies: props.dependencies || [],
    dependants: props.dependants || [],
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
    toProps: jest.fn(),
    credentialManager: {
      createCredentialManagerForRole: jest.fn(),
      getCallerIdentity: jest.fn(),
      getCredentials: jest.fn(),
      name: "",
    },
    getCurrentCloudFormationStack: jest.fn(),
  }
}
