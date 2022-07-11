import { buildProject } from "../../src/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildProject", () => {
  test("no project", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildProject({ stackGroup, stackConfig, blueprint })).toBeUndefined()
  })

  test("project defined in stack group", () => {
    const stackGroup = createStackGroup({ project: "iii" })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildProject({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      "iii",
    )
  })

  test("project defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ project: "zzz" })

    expect(buildProject({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      "zzz",
    )
  })

  test("project defined in blueprint and stack group", () => {
    const stackGroup = createStackGroup({ project: "y" })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ project: "x" })

    expect(buildProject({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      "x",
    )
  })

  test("project defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      project: "d",
    })
    const blueprint = createStackConfig({ project: "c" })

    expect(buildProject({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      "d",
    )
  })

  test("project defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      project: "z",
    })
    const blueprint = createStackConfig()

    expect(buildProject({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      "z",
    )
  })
})
