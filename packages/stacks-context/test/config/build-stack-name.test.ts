import { buildStackName } from "../../src/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildStackName", () => {
  test("name defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({ name: "my-stack" })
    const blueprint = undefined
    const stackPath = "/stack.yml"

    expect(
      buildStackName({ stackGroup, stackConfig, blueprint }, stackPath),
    ).toStrictEqual("my-stack")
  })

  test("name defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ name: "rds" })
    const stackPath = "/rds.yml"

    expect(
      buildStackName({ stackGroup, stackConfig, blueprint }, stackPath),
    ).toStrictEqual("rds")
  })

  test("name defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({ name: "real-name" })
    const blueprint = createStackConfig({ name: "default-name" })
    const stackPath = "/rds.yml"

    expect(
      buildStackName({ stackGroup, stackConfig, blueprint }, stackPath),
    ).toStrictEqual("real-name")
  })

  test("name not defined at all", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined
    const stackPath = "/stack123.yml"

    expect(
      buildStackName({ stackGroup, stackConfig, blueprint }, stackPath),
    ).toStrictEqual("stack123")
  })

  test("name not defined at all and project defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({ project: "example" })
    const blueprint = undefined
    const stackPath = "/databases/rds.yml"

    expect(
      buildStackName({ stackGroup, stackConfig, blueprint }, stackPath),
    ).toStrictEqual("example-databases-rds")
  })

  test("name not defined at all and project defined in stack group", () => {
    const stackGroup = createStackGroup({ project: "Foobar" })
    const stackConfig = createStackConfig()
    const blueprint = undefined
    const stackPath = "/databases/rds.yml"

    expect(
      buildStackName({ stackGroup, stackConfig, blueprint }, stackPath),
    ).toStrictEqual("Foobar-databases-rds")
  })

  test("name not defined at all and project defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ project: "HELLO" })
    const stackPath = "/databases/rds.yml"

    expect(
      buildStackName({ stackGroup, stackConfig, blueprint }, stackPath),
    ).toStrictEqual("HELLO-databases-rds")
  })

  test("name not defined at all, project defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({ project: "good" })
    const blueprint = createStackConfig({ project: "HELLO" })
    const stackPath = "/databases/rds.yml"

    expect(
      buildStackName({ stackGroup, stackConfig, blueprint }, stackPath),
    ).toStrictEqual("good-databases-rds")
  })
})
