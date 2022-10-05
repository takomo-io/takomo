import { mock } from "jest-mock-extended"
import { PlannedDeploymentTarget } from "../../../src/takomo-deployment-targets-commands"
import { createDeploymentTargetVariables } from "../../../src/takomo-deployment-targets-commands/operation/create-deployment-target-variables"
import { DeploymentTargetsContext } from "../../../src/takomo-deployment-targets-context"
import { ConfigSetExecutionTarget } from "../../../src/takomo-execution-plans"

const ctx = mock<DeploymentTargetsContext>()

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
