import { CredentialManager } from "@takomo/aws-clients"
import { StackName } from "@takomo/aws-model"
import { InternalStack, StackPath } from "@takomo/stacks-model"
import { createConsoleLogger } from "@takomo/util"
import { Credentials } from "aws-sdk"
import { mock } from "jest-mock-extended"

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
