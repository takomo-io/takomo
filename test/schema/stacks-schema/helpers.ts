import { mock } from "jest-mock-extended"
import { StackName } from "../../../src/aws/cloudformation/model.js"
import { InternalCredentialManager } from "../../../src/aws/common/credentials.js"
import { InternalStack, StackPath } from "../../../src/stacks/stack.js"
import { createConsoleLogger } from "../../../src/utils/logging.js"

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
  getCloudFormationClient: () => mock(),
  toProps: () => mock(),
  credentialManager: mock<InternalCredentialManager>(),
  getCurrentCloudFormationStack: () => mock(),
  getCredentials: () => mock(),
  getClient: () => mock(),
})
