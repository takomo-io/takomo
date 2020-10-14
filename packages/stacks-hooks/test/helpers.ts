import { StackName, StackPath } from "@takomo/core"
import { Stack } from "@takomo/stacks-model"
import { ConsoleLogger } from "@takomo/util"

export interface TestStackProps {
  path: StackPath
  name: StackName
  dependencies?: StackPath[]
  dependants?: StackPath[]
}

export const createStack = (props: TestStackProps): Stack => {
  return new Stack({
    path: props.path,
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
    stackGroupPath: "",
    logger: new ConsoleLogger(),
  })
}
