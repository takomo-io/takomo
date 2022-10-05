import { buildTerminationProtection } from "../../../src/takomo-stacks-context/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildTerminationProtection", () => {
  test("no termination protection", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildTerminationProtection({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(false)
  })

  test("termination protection defined in stack group", () => {
    const stackGroup = createStackGroup({ terminationProtection: true })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildTerminationProtection({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(true)
  })

  test("termination protection defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ terminationProtection: true })

    expect(
      buildTerminationProtection({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(true)
  })

  test("termination protection defined in blueprint and stack group", () => {
    const stackGroup = createStackGroup({ terminationProtection: true })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ terminationProtection: false })

    expect(
      buildTerminationProtection({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(false)
  })

  test("termination protection defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      terminationProtection: false,
    })
    const blueprint = createStackConfig({ terminationProtection: true })

    expect(
      buildTerminationProtection({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(false)
  })

  test("termination protection defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      terminationProtection: true,
    })
    const blueprint = createStackConfig()

    expect(
      buildTerminationProtection({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(true)
  })
})
