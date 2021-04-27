import { CommandContext } from "@takomo/core"
import { DeploymentTargetsSchemaRegistry } from "@takomo/deployment-targets-model"
import { TkmLogger } from "@takomo/util"
import { parseYaml } from "@takomo/util/src"
import { readFileSync } from "fs"
import { mock } from "jest-mock-extended"
import { join } from "path"
import { buildDeploymentConfig } from "../src"

const ctx = mock<CommandContext>({ regions: ["eu-north-1"] })

const readConfig = (file: string) =>
  parseYaml(
    file,
    readFileSync(
      join(process.cwd(), "test/build-deployment-config", file),
    ).toString("utf-8"),
  )

const logger = mock<TkmLogger>()
const schemaRegistry = mock<DeploymentTargetsSchemaRegistry>()

describe("#buildDeploymentConfig", () => {
  test("Single deployment group", async () => {
    const externalTargets = new Map()
    const record = readConfig("01.yml")
    const result = await buildDeploymentConfig(
      ctx,
      logger,
      schemaRegistry,
      externalTargets,
      new Map(),
      record,
    )
    if (result.isErr()) {
      fail("Expected result to be ok")
    }
    expect(result.value.deploymentGroups).toHaveLength(1)
  })

  test("Single deployment group with single external deployment target", async () => {
    const target1 = {
      deploymentGroupPath: "group1",
      name: "target1",
    }
    const externalTargets = new Map([["group1", [target1]]])
    const record = readConfig("01.yml")
    const result = await buildDeploymentConfig(
      ctx,
      logger,
      schemaRegistry,
      externalTargets,
      new Map(),
      record,
    )
    if (result.isErr()) {
      fail("Expected result to be ok")
    }
    const config = result.value
    expect(config.deploymentGroups).toHaveLength(1)
    const { targets } = config.deploymentGroups[0]
    expect(targets).toHaveLength(1)
  })

  test("Single deployment group with multiple external deployment targets", async () => {
    const target1 = {
      deploymentGroupPath: "group1",
      name: "target1",
    }
    const target2 = {
      deploymentGroupPath: "group1",
      name: "target2",
    }
    const target3 = {
      deploymentGroupPath: "group1",
      name: "target3",
    }
    const externalTargets = new Map([["group1", [target1, target2, target3]]])
    const record = readConfig("01.yml")
    const result = await buildDeploymentConfig(
      ctx,
      logger,
      schemaRegistry,
      externalTargets,
      new Map(),
      record,
    )
    if (result.isErr()) {
      fail("Expected result to be ok")
    }
    const config = result.value
    expect(config.deploymentGroups).toHaveLength(1)
    const { targets } = config.deploymentGroups[0]
    expect(targets).toHaveLength(3)
  })

  test("Deployment groups with multiple external deployment targets", async () => {
    const target1 = {
      deploymentGroupPath: "group1",
      name: "target1",
    }
    const target2 = {
      deploymentGroupPath: "group1",
      name: "target2",
    }
    const target3 = {
      deploymentGroupPath: "group2",
      name: "target3",
    }
    const target4 = {
      deploymentGroupPath: "group3",
      name: "target4",
    }
    const target5 = {
      deploymentGroupPath: "group2",
      name: "target5",
    }
    const externalTargets = new Map([
      ["group1", [target1, target2]],
      ["group2", [target3, target5]],
      ["group3", [target4]],
    ])
    const record = readConfig("02.yml")
    const result = await buildDeploymentConfig(
      ctx,
      logger,
      schemaRegistry,
      externalTargets,
      new Map(),
      record,
    )
    if (result.isErr()) {
      fail("Expected result to be ok")
    }

    const config = result.value
    expect(config.deploymentGroups).toHaveLength(3)

    const group1Targets = config.deploymentGroups[0].targets
    const group2Targets = config.deploymentGroups[1].targets
    const group3Targets = config.deploymentGroups[2].targets

    expect(group1Targets).toHaveLength(2)
    expect(group2Targets).toHaveLength(2)
    expect(group3Targets).toHaveLength(1)

    expect(group1Targets[0].name).toStrictEqual("target1")
    expect(group1Targets[1].name).toStrictEqual("target2")

    expect(group2Targets[0].name).toStrictEqual("target3")
    expect(group2Targets[1].name).toStrictEqual("target5")

    expect(group3Targets[0].name).toStrictEqual("target4")
  })

  test("An error is returned if external deployment targets refer to groups not found from the configuration", async () => {
    const target1 = {
      deploymentGroupPath: "group1",
      name: "target1",
    }
    const target2 = {
      deploymentGroupPath: "group3",
      name: "target2",
    }
    const target3 = {
      deploymentGroupPath: "group1",
      name: "target3",
    }
    const externalTargets = new Map([
      ["group1", [target1, target3]],
      ["group3", [target2]],
    ])
    const record = readConfig("01.yml")
    const result = await buildDeploymentConfig(
      ctx,
      logger,
      schemaRegistry,
      externalTargets,
      new Map(),
      record,
    )

    if (result.isOk()) {
      fail("Expected result to be error")
    }

    expect(result.error.message).toStrictEqual(
      "Validation errors in deployment configuration.",
    )

    expect(result.error.messages[0]).toStrictEqual(
      "Deployment group 'group3' is not found from the configuration file but is referenced in externally configured targets.",
    )
  })

  test("An error is returned if external deployment target names are not unique", async () => {
    const target1 = {
      deploymentGroupPath: "group1",
      name: "target1",
    }
    const target2 = {
      deploymentGroupPath: "group1",
      name: "target1",
    }
    const externalTargets = new Map([["group1", [target1, target2]]])
    const record = readConfig("01.yml")
    const result = await buildDeploymentConfig(
      ctx,
      logger,
      schemaRegistry,
      externalTargets,
      new Map(),
      record,
    )

    if (result.isOk()) {
      fail("Expected result to be error")
    }

    expect(result.error.message).toStrictEqual(
      "Validation errors in deployment configuration.",
    )

    expect(result.error.messages[0]).toStrictEqual(
      "Deployment target 'target1' is specified more than once in the externally configured targets",
    )
  })

  test("An error is returned if target names are not unique", async () => {
    const externalTargets = new Map()
    const record = readConfig("03.yml")
    const result = await buildDeploymentConfig(
      ctx,
      logger,
      schemaRegistry,
      externalTargets,
      new Map(),
      record,
    )

    if (result.isOk()) {
      fail("Expected result to be error")
    }

    expect(result.error.message).toStrictEqual(
      "Validation errors in deployment configuration.",
    )

    expect(result.error.messages[0]).toStrictEqual(
      "Target 'hello' is defined more than once in the configuration.",
    )
  })

  test("An error is returned if target names are not unique #2", async () => {
    const target1 = {
      deploymentGroupPath: "group1",
      name: "foobar",
    }
    const externalTargets = new Map([["group1", [target1]]])
    const record = readConfig("04.yml")
    const result = await buildDeploymentConfig(
      ctx,
      logger,
      schemaRegistry,
      externalTargets,
      new Map(),
      record,
    )

    if (result.isOk()) {
      fail("Expected result to be error")
    }

    expect(result.error.message).toStrictEqual(
      "Validation errors in deployment configuration.",
    )

    expect(result.error.messages[0]).toStrictEqual(
      "Target 'foobar' is defined more than once in the configuration.",
    )
  })
})
