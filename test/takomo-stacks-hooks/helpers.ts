import { Credentials } from "@aws-sdk/types"
import { mock } from "jest-mock-extended"
import { CredentialManager } from "../../src/takomo-aws-clients"
import { StackName } from "../../src/takomo-aws-model"
import { InternalStack, StackPath } from "../../src/takomo-stacks-model"
import { createConsoleLogger } from "../../src/takomo-util"

export interface TestStackProps {
  path: StackPath
  name: StackName
  dependencies?: StackPath[]
  dependents?: StackPath[]
}

export const createStack = (props: TestStackProps): InternalStack => {
  return {
    path: props.path,
    name: props.name,
    dependencies: props.dependencies || [],
    dependents: props.dependents || [],
    template: { dynamic: true, filename: "" },
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
    obsolete: false,
    terminationProtection: false,
    logger: createConsoleLogger({
      logLevel: "info",
    }),
    stackGroupPath: "/",
    getCloudFormationClient: jest.fn(),
    toProps: jest.fn(),
    credentialManager: mock<CredentialManager>(),
    getCurrentCloudFormationStack: jest.fn(),
    credentials: mock<Credentials>(),
  }
}
