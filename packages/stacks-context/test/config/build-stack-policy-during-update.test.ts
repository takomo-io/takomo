import { buildStackPolicyDuringUpdate } from "../../src/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildStackPolicyDuringUpdate", () => {
  test("no stack policy during update", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildStackPolicyDuringUpdate({ stackGroup, stackConfig, blueprint }),
    ).toBeUndefined()
  })

  test("stack policy during update defined in stack group", () => {
    const stackGroup = createStackGroup({ stackPolicyDuringUpdate: "policy" })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildStackPolicyDuringUpdate({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual("policy")
  })

  test("stack policy during update defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ stackPolicyDuringUpdate: "policy-x" })

    expect(
      buildStackPolicyDuringUpdate({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual("policy-x")
  })

  test("stack policy during update defined in blueprint and stack group", () => {
    const stackGroup = createStackGroup({ stackPolicyDuringUpdate: "y" })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ stackPolicyDuringUpdate: "x" })

    expect(
      buildStackPolicyDuringUpdate({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual("x")
  })

  test("stack policy during update defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      stackPolicyDuringUpdate: "d",
    })
    const blueprint = createStackConfig({ stackPolicyDuringUpdate: "c" })

    expect(
      buildStackPolicyDuringUpdate({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual("d")
  })

  test("stack policy during update defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      stackPolicyDuringUpdate: "z",
    })
    const blueprint = createStackConfig()

    expect(
      buildStackPolicyDuringUpdate({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual("z")
  })
})
