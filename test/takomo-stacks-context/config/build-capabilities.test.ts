import { createStackConfig, createStackGroup } from "../helpers.js"
import { buildCapabilities } from "../../../src/takomo-stacks-context/config/build-standard-stack.js"

describe("#buildCapabilities", () => {
  test("no capabilities", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildCapabilities({ stackGroup, stackConfig, blueprint }),
    ).toBeUndefined()
  })

  test("capabilities defined in stack group", () => {
    const stackGroup = createStackGroup({ capabilities: ["CAPABILITY_IAM"] })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildCapabilities({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(["CAPABILITY_IAM"])
  })

  test("capabilities defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      capabilities: ["CAPABILITY_NAMED_IAM"],
    })

    expect(
      buildCapabilities({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(["CAPABILITY_NAMED_IAM"])
  })

  test("capabilities defined in blueprint and stack group", () => {
    const stackGroup = createStackGroup({ capabilities: [] })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      capabilities: ["CAPABILITY_AUTO_EXPAND"],
    })

    expect(
      buildCapabilities({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(["CAPABILITY_AUTO_EXPAND"])
  })

  test("capabilities defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      capabilities: ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"],
    })
    const blueprint = createStackConfig({ capabilities: [] })

    expect(
      buildCapabilities({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"])
  })

  test("capabilities defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      capabilities: ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"],
    })
    const blueprint = createStackConfig()

    expect(
      buildCapabilities({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"])
  })
})
