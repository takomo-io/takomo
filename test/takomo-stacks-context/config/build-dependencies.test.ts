import { buildDependencies } from "../../../src/takomo-stacks-context/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("buildDependencies", () => {
  test("no dependencies", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildDependencies({ stackConfig, blueprint, stackGroup }),
    ).toStrictEqual([])
  })

  test("empty dependencies defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({ depends: [] })
    const blueprint = undefined

    expect(
      buildDependencies({ stackConfig, blueprint, stackGroup }),
    ).toStrictEqual([])
  })

  test("empty dependencies defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ depends: [] })

    expect(
      buildDependencies({ stackConfig, blueprint, stackGroup }),
    ).toStrictEqual([])
  })

  test("dependencies defined in stack config", () => {
    const stackGroup = createStackGroup({ path: "/parent/path" })
    const stackConfig = createStackConfig({
      depends: ["../my/other/stack.yml", "/rds.yml"],
    })
    const blueprint = undefined

    expect(
      buildDependencies({ stackConfig, blueprint, stackGroup }),
    ).toStrictEqual(["/parent/my/other/stack.yml", "/rds.yml"])
  })

  test("dependencies defined in blueprint", () => {
    const stackGroup = createStackGroup({ path: "/example" })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      depends: ["/vpc.yml", "relative/dependency.yml"],
    })

    expect(
      buildDependencies({ stackConfig, blueprint, stackGroup }),
    ).toStrictEqual(["/vpc.yml", "/example/relative/dependency.yml"])
  })

  test("dependencies defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup({ path: "/example" })
    const stackConfig = createStackConfig({ depends: ["/other.yml"] })
    const blueprint = createStackConfig({
      depends: ["/vpc.yml", "relative/dependency.yml"],
    })

    expect(
      buildDependencies({ stackConfig, blueprint, stackGroup }),
    ).toStrictEqual(["/other.yml"])
  })

  test("dependencies defined in blueprint and stack config #2", () => {
    const stackGroup = createStackGroup({ path: "/example" })
    const stackConfig = createStackConfig({ depends: [] })
    const blueprint = createStackConfig({
      depends: ["/vpc.yml", "relative/dependency.yml"],
    })

    expect(
      buildDependencies({ stackConfig, blueprint, stackGroup }),
    ).toStrictEqual([])
  })
})
