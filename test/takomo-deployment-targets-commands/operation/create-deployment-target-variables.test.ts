import { mock } from "jest-mock-extended"
import { InternalAwsClientProvider } from "../../../src/aws/aws-client-provider.js"
import { InternalCredentialManager } from "../../../src/aws/common/credentials.js"
import { PlannedDeploymentTarget } from "../../../src/command/targets/common/plan/model.js"
import { createDeploymentTargetVariables } from "../../../src/command/targets/operation/create-deployment-target-variables.js"
import { InternalTakomoProjectConfig } from "../../../src/config/project-config.js"
import { DeploymentConfig } from "../../../src/config/targets-config.js"
import {
  InternalCommandContext,
  TakomoBuildInfo,
} from "../../../src/context/command-context.js"
import {
  DeploymentTargetsConfigRepository,
  DeploymentTargetsContext,
} from "../../../src/context/targets-context.js"
import { ConfigSetExecutionTarget } from "../../../src/takomo-execution-plans.js"
import { createConsoleLogger } from "../../../src/utils/logging.js"

const ctx: DeploymentTargetsContext = {
  autoConfirmEnabled: false,
  awsClientProvider: mock<InternalAwsClientProvider>(),
  buildInfo: mock<TakomoBuildInfo>(),
  resetCache: false,
  commandContext: mock<InternalCommandContext>(),
  confidentialValuesLoggingEnabled: false,
  configRepository: mock<DeploymentTargetsConfigRepository>(),
  credentialManager: mock<InternalCredentialManager>(),
  deploymentConfig: mock<DeploymentConfig>(),
  getConfigSet: jest.fn(),
  getDeploymentGroup: jest.fn(),
  getStages: jest.fn(),
  hasConfigSet: jest.fn(),
  hasDeploymentGroup: jest.fn(),
  iamGeneratePoliciesInstructionsEnabled: false,
  logLevel: "info",
  logger: createConsoleLogger({ logLevel: "info" }),
  outputFormat: "text",
  projectConfig: mock<InternalTakomoProjectConfig>(),
  projectDir: "",
  quiet: false,
  regions: [],
  rootDeploymentGroups: [],
  statisticsEnabled: false,
  variables: {
    env: { LANG: "FI" },
    context: { projectDir: "/tmp" },
    var: { code: "123", task: { priority: 1 } },
  },
}

const target: ConfigSetExecutionTarget<PlannedDeploymentTarget> = {
  configSets: [],
  id: "cool",
  vars: {
    person: { name: "John", age: 10 },
  },
  data: {
    accountId: "123456789012",
    status: "active",
    name: "",
    vars: {},
    labels: [],
    configSets: [],
    deploymentGroup: {
      name: "my-group",
      path: "path/to/my-group",
    },
  },
}

describe("#createDeploymentTargetVariables", () => {
  test("creates correct variables", () => {
    const variables = createDeploymentTargetVariables({
      ctx,
      target,
    })
    expect(variables).toStrictEqual({
      env: { LANG: "FI" },
      context: { projectDir: "/tmp" },
      var: { person: { name: "John", age: 10 } },
      target: {
        name: "cool",
        accountId: "123456789012",
        deploymentGroup: {
          name: "my-group",
          path: "path/to/my-group",
        },
      },
    })
  })
})
