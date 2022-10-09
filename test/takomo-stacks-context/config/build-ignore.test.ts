import { buildIgnore } from "../../../src/takomo-stacks-context/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildIgnore", () => {
  test("no ignore", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildIgnore({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      false,
    )
  })

  test("ignore defined in stack group", () => {
    const stackGroup = createStackGroup({ ignore: true })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildIgnore({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      true,
    )
  })

  test("ignore defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ ignore: true })

    expect(buildIgnore({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      true,
    )
  })

  test("ignore defined in blueprint and stack group", () => {
    const stackGroup = createStackGroup({ ignore: true })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ ignore: false })

    expect(buildIgnore({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      false,
    )
  })

  test("ignore defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      ignore: false,
    })
    const blueprint = createStackConfig({ ignore: true })

    expect(buildIgnore({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      false,
    )
  })

  test("ignore defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      ignore: true,
    })
    const blueprint = createStackConfig()

    expect(buildIgnore({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      true,
    )
  })
})
