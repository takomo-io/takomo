import { ConfigSetInstruction } from "../../src/takomo-config-sets"
import { DeploymentTargetConfig } from "../../src/takomo-deployment-targets-config"
import { parseDeploymentTarget } from "../../src/takomo-deployment-targets-config/parser/parse-deployment-targets"
import { Label } from "../../src/takomo-deployment-targets-model"

describe("#parseDeploymentTarget", () => {
  test("simple", () => {
    const value = { name: "hello" }
    const inheritedVars = {}
    const inheritedConfigSets = new Array<ConfigSetInstruction>()
    const inheritedBootstrapConfigSets = new Array<ConfigSetInstruction>()
    const inheritedLabels = new Array<Label>()
    const inheritedDeploymentRole = undefined
    const inheritedDeploymentRoleName = undefined
    const inheritedBootstrapRole = undefined
    const inheritedBootstrapRoleName = undefined

    const actual = parseDeploymentTarget(
      value,
      inheritedVars,
      inheritedConfigSets,
      inheritedBootstrapConfigSets,
      inheritedLabels,
      inheritedDeploymentRole,
      inheritedDeploymentRoleName,
      inheritedBootstrapRole,
      inheritedBootstrapRoleName,
    )

    const expected: DeploymentTargetConfig = {
      accountId: undefined,
      vars: {},
      configSets: [],
      bootstrapConfigSets: [],
      labels: [],
      deploymentRole: undefined,
      deploymentRoleName: undefined,
      bootstrapRole: undefined,
      bootstrapRoleName: undefined,
      status: "active",
      name: "hello",
      description: undefined,
    }

    expect(actual).toStrictEqual(expected)
  })

  test("inherited vars", () => {
    const value = {
      name: "hello2",
      description: "this is how you do it",
      vars: {
        person: {
          age: 10,
        },
      },
    }

    const inheritedVars = {
      person: {
        age: 30,
        cool: true,
        color: "red",
      },
    }
    const inheritedConfigSets = new Array<ConfigSetInstruction>()
    const inheritedBootstrapConfigSets = new Array<ConfigSetInstruction>()
    const inheritedLabels = new Array<Label>()
    const inheritedDeploymentRole = undefined
    const inheritedDeploymentRoleName = undefined
    const inheritedBootstrapRole = undefined
    const inheritedBootstrapRoleName = undefined

    const actual = parseDeploymentTarget(
      value,
      inheritedVars,
      inheritedConfigSets,
      inheritedBootstrapConfigSets,
      inheritedLabels,
      inheritedDeploymentRole,
      inheritedDeploymentRoleName,
      inheritedBootstrapRole,
      inheritedBootstrapRoleName,
    )

    const expected: DeploymentTargetConfig = {
      accountId: undefined,
      vars: {
        person: {
          age: 10,
          cool: true,
          color: "red",
        },
      },
      configSets: [],
      bootstrapConfigSets: [],
      labels: [],
      deploymentRole: undefined,
      deploymentRoleName: undefined,
      bootstrapRole: undefined,
      bootstrapRoleName: undefined,
      status: "active",
      name: "hello2",
      description: "this is how you do it",
    }

    expect(actual).toStrictEqual(expected)
  })
})
