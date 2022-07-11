import { buildObsolete } from "../../src/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildObsolete", () => {
  test("no obsolete", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildObsolete({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      false,
    )
  })

  test("obsolete defined in stack group", () => {
    const stackGroup = createStackGroup({ obsolete: true })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildObsolete({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      true,
    )
  })

  test("obsolete defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ obsolete: true })

    expect(buildObsolete({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      true,
    )
  })

  test("obsolete defined in blueprint and stack group", () => {
    const stackGroup = createStackGroup({ obsolete: true })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ obsolete: false })

    expect(buildObsolete({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      false,
    )
  })

  test("obsolete defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      obsolete: false,
    })
    const blueprint = createStackConfig({ obsolete: true })

    expect(buildObsolete({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      false,
    )
  })

  test("obsolete defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      obsolete: true,
    })
    const blueprint = createStackConfig()

    expect(buildObsolete({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      true,
    )
  })
})
