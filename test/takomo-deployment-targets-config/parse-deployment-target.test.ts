import { ConfigSetInstruction } from "../../src"
import { DeploymentTargetConfig } from "../../src/config/targets-config"
import { parseDeploymentTarget } from "../../src/parser/targets/parse-deployment-targets"
import { Label } from "../../src/targets/targets-model"

describe("#parseDeploymentTarget", () => {
  test("simple", () => {
    const value = { name: "hello" }
    const inheritedVars = {}
    const inheritedConfigSets = new Array<ConfigSetInstruction>()
    const inheritedLabels = new Array<Label>()
    const inheritedDeploymentRole = undefined
    const inheritedDeploymentRoleName = undefined

    const actual = parseDeploymentTarget(
      value,
      inheritedVars,
      inheritedConfigSets,
      inheritedLabels,
      inheritedDeploymentRole,
      inheritedDeploymentRoleName,
    )

    const expected: DeploymentTargetConfig = {
      accountId: undefined,
      vars: {},
      configSets: [],
      labels: [],
      deploymentRole: undefined,
      deploymentRoleName: undefined,
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
    const inheritedLabels = new Array<Label>()
    const inheritedDeploymentRole = undefined
    const inheritedDeploymentRoleName = undefined

    const actual = parseDeploymentTarget(
      value,
      inheritedVars,
      inheritedConfigSets,
      inheritedLabels,
      inheritedDeploymentRole,
      inheritedDeploymentRoleName,
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
      labels: [],
      deploymentRole: undefined,
      deploymentRoleName: undefined,
      status: "active",
      name: "hello2",
      description: "this is how you do it",
    }

    expect(actual).toStrictEqual(expected)
  })
})
