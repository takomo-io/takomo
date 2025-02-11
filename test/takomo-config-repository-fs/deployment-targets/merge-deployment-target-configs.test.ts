import { mergeDeploymentTargetConfigs } from "../../../src/takomo-config-repository-fs/deployment-targets/merge-deployment-target-configs.js"
import { DeploymentTargetConfigItem } from "../../../src/takomo-deployment-targets-repository/deployment-target-repository.js"

describe("#mergeDeploymentTargetConfigs", () => {
  test("empty list of targets", () => {
    expect(mergeDeploymentTargetConfigs([])).toHaveLength(0)
  })
  test("single target", () => {
    const target: DeploymentTargetConfigItem = {
      name: "a",
      deploymentGroupPath: "hello",
    }
    expect(mergeDeploymentTargetConfigs([target])).toStrictEqual([target])
  })
  test("two targets of different name", () => {
    const target1: DeploymentTargetConfigItem = {
      name: "a",
      deploymentGroupPath: "hello",
    }
    const target2: DeploymentTargetConfigItem = {
      name: "b",
      deploymentGroupPath: "hello",
    }
    expect(mergeDeploymentTargetConfigs([target1, target2])).toStrictEqual([
      target1,
      target2,
    ])
  })
  test("two targets of same name", () => {
    const target1: DeploymentTargetConfigItem = {
      name: "c",
      deploymentGroupPath: "hello",
    }
    const target2: DeploymentTargetConfigItem = {
      name: "c",
      deploymentGroupPath: "another",
    }
    const expected: DeploymentTargetConfigItem = {
      accountId: undefined,
      configSets: [],
      deploymentGroupPath: "another",
      deploymentRole: undefined,
      deploymentRoleName: undefined,
      description: undefined,
      labels: [],
      name: "c",
      status: undefined,
      vars: {},
    }
    expect(mergeDeploymentTargetConfigs([target1, target2])).toStrictEqual([
      expected,
    ])
  })
  test("three targets of same name", () => {
    const target1: DeploymentTargetConfigItem = {
      name: "c",
      deploymentGroupPath: "hello",
      labels: ["yyy"],
      deploymentRoleName: "roleA",
      vars: {
        environment: {
          code: "prod",
        },
      },
    }
    const target2: DeploymentTargetConfigItem = {
      name: "c",
      deploymentGroupPath: "another",
      labels: ["xxx"],
      deploymentRoleName: "roleX",
      vars: {
        list: [1, 2, 3],
      },
    }
    const target3: DeploymentTargetConfigItem = {
      name: "c",
      deploymentGroupPath: "last",
      labels: [],
      status: "active",
      vars: {
        hello: "world",
        environment: {
          name: "Production",
        },
      },
    }
    const expected: DeploymentTargetConfigItem = {
      accountId: undefined,
      configSets: [],
      deploymentGroupPath: "last",
      deploymentRole: undefined,
      deploymentRoleName: "roleX",
      description: undefined,
      labels: ["yyy", "xxx"],
      name: "c",
      status: "active",
      vars: {
        hello: "world",
        list: [1, 2, 3],
        environment: {
          code: "prod",
          name: "Production",
        },
      },
    }
    expect(
      mergeDeploymentTargetConfigs([target1, target2, target3]),
    ).toStrictEqual([expected])
  })
  test("multiple targets", () => {
    const target1: DeploymentTargetConfigItem = {
      name: "a",
      deploymentGroupPath: "hello",
    }
    const target2: DeploymentTargetConfigItem = {
      name: "b",
      deploymentGroupPath: "hello",
    }
    const target3: DeploymentTargetConfigItem = {
      name: "b",
      deploymentGroupPath: "hello",
    }
    const target4: DeploymentTargetConfigItem = {
      name: "a",
      deploymentGroupPath: "hello",
    }
    const expected1: DeploymentTargetConfigItem = {
      accountId: undefined,
      configSets: [],
      deploymentGroupPath: "hello",
      deploymentRole: undefined,
      deploymentRoleName: undefined,
      description: undefined,
      labels: [],
      name: "a",
      status: undefined,
      vars: {},
    }
    const expected2: DeploymentTargetConfigItem = {
      accountId: undefined,
      configSets: [],
      deploymentGroupPath: "hello",
      deploymentRole: undefined,
      deploymentRoleName: undefined,
      description: undefined,
      labels: [],
      name: "b",
      status: undefined,
      vars: {},
    }
    expect(
      mergeDeploymentTargetConfigs([target1, target2, target3, target4]),
    ).toStrictEqual([expected1, expected2])
  })
})
