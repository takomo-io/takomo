import { DeploymentTargetsContext } from "@takomo/deployment-targets-context"
import { ConfigSetExecutionTarget } from "@takomo/execution-plans"
import { PlannedDeploymentTarget } from "../../src"
import { createDeploymentTargetVariables } from "../../src/operation/create-deployment-target-variables"

const ctx: DeploymentTargetsContext = {
  autoConfirmEnabled: false,
  awsClientProvider: undefined,
  buildInfo: undefined,
  commandContext: undefined,
  confidentialValuesLoggingEnabled: false,
  configRepository: undefined,
  credentialManager: undefined,
  deploymentConfig: undefined,
  getConfigSet: jest.fn(),
  getDeploymentGroup: jest.fn(),
  getStages: jest.fn(),
  hasConfigSet: jest.fn(),
  hasDeploymentGroup: jest.fn(),
  iamGeneratePoliciesInstructionsEnabled: false,
  logLevel: undefined,
  logger: undefined,
  outputFormat: undefined,
  projectConfig: undefined,
  projectDir: "",
  quiet: false,
  regions: undefined,
  rootDeploymentGroups: undefined,
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
    deploymentGroup: {
      name: "my-group",
      path: "path/to/my-group",
    },
  },
}

describe("#createDeploymentTargetVariables", () => {
  test("creates correct variables", () => {
    console.log("_--------")
    console.log(JSON.stringify(ctx.variables.env, undefined, 2))
    console.log("_--------")
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
