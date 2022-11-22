import { mock } from "jest-mock-extended"
import { InternalCredentialManager } from "../../../src/takomo-aws-clients"
import { StackName } from "../../../src/takomo-aws-model"
import { InternalStack, StackPath } from "../../../src/takomo-stacks-model"
import { createConsoleLogger } from "../../../src/utils/logging"

export interface TestStackProps {
  path: StackPath
  name: StackName
  dependencies?: StackPath[]
  dependents?: StackPath[]
}

export const createStack = (props: TestStackProps): InternalStack => ({
  path: props.path,
  name: props.name,
  dependencies: props.dependencies ?? [],
  dependents: props.dependents ?? [],
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
  credentialManager: mock<InternalCredentialManager>(),
  getCurrentCloudFormationStack: jest.fn(),
  getCredentials: jest.fn(),
  getClient: jest.fn(),
})
