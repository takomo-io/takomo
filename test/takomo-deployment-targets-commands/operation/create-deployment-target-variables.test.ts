import { mock } from "jest-mock-extended"
import {
  CredentialManager,
  InternalAwsClientProvider,
} from "../../../src/takomo-aws-clients"
import {
  InternalCommandContext,
  InternalTakomoProjectConfig,
  TakomoBuildInfo,
} from "../../../src/takomo-core"
import { PlannedDeploymentTarget } from "../../../src/takomo-deployment-targets-commands"
import { createDeploymentTargetVariables } from "../../../src/takomo-deployment-targets-commands/operation/create-deployment-target-variables"
import { DeploymentConfig } from "../../../src/takomo-deployment-targets-config"
import {
  DeploymentTargetsConfigRepository,
  DeploymentTargetsContext,
} from "../../../src/takomo-deployment-targets-context"
import { ConfigSetExecutionTarget } from "../../../src/takomo-execution-plans"
import { createConsoleLogger } from "../../../src/takomo-util"

const ctx: DeploymentTargetsContext = {
  autoConfirmEnabled: false,
  awsClientProvider: mock<InternalAwsClientProvider>(),
  buildInfo: mock<TakomoBuildInfo>(),
  resetCache: false,
  commandContext: mock<InternalCommandContext>(),
  confidentialValuesLoggingEnabled: false,
  configRepository: mock<DeploymentTargetsConfigRepository>(),
  credentialManager: mock<CredentialManager>(),
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
    bootstrapConfigSets: [],
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
