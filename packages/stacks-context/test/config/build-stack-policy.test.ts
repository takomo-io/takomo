import { buildStackPolicy } from "../../src/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildStackPolicy", () => {
  test("no stack policy", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildStackPolicy({ stackGroup, stackConfig, blueprint }),
    ).toBeUndefined()
  })

  test("stack policy defined in stack group", () => {
    const stackGroup = createStackGroup({ stackPolicy: "policy" })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildStackPolicy({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual("policy")
  })

  test("stack policy defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ stackPolicy: "policy-x" })

    expect(
      buildStackPolicy({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual("policy-x")
  })

  test("stack policy defined in blueprint and stack group", () => {
    const stackGroup = createStackGroup({ stackPolicy: "y" })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ stackPolicy: "x" })

    expect(
      buildStackPolicy({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual("x")
  })

  test("stack policy defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      stackPolicy: "d",
    })
    const blueprint = createStackConfig({ stackPolicy: "c" })

    expect(
      buildStackPolicy({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual("d")
  })

  test("stack policy defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      stackPolicy: "z",
    })
    const blueprint = createStackConfig()

    expect(
      buildStackPolicy({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual("z")
  })
})
