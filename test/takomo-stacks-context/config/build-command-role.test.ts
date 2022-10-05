import { buildCommandRole } from "../../../src/takomo-stacks-context/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildCommandRole", () => {
  test("no command role", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildCommandRole({ stackGroup, stackConfig, blueprint }),
    ).toBeUndefined()
  })

  test("command role defined in stack group", () => {
    const stackGroup = createStackGroup({ commandRole: { iamRoleArn: "xxx" } })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildCommandRole({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({
      iamRoleArn: "xxx",
    })
  })

  test("command role defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ commandRole: { iamRoleArn: "yyy" } })

    expect(
      buildCommandRole({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({
      iamRoleArn: "yyy",
    })
  })

  test("command role defined in blueprint and stack group", () => {
    const stackGroup = createStackGroup({ commandRole: { iamRoleArn: "aaa" } })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ commandRole: { iamRoleArn: "ccc" } })

    expect(
      buildCommandRole({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({
      iamRoleArn: "ccc",
    })
  })

  test("command role defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      commandRole: { iamRoleArn: "xxx" },
    })
    const blueprint = createStackConfig({ commandRole: { iamRoleArn: "fff" } })

    expect(
      buildCommandRole({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({
      iamRoleArn: "xxx",
    })
  })

  test("command role defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      commandRole: { iamRoleArn: "uuu" },
    })
    const blueprint = createStackConfig()

    expect(
      buildCommandRole({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual({
      iamRoleArn: "uuu",
    })
  })
})
