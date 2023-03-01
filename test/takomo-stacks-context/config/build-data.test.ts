import { buildData } from "../../../src/takomo-stacks-context/config/build-stack.js"
import { createStackConfig, createStackGroup } from "../helpers.js"

describe("#buildData", () => {
  test("no data", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildData({ stackGroup, stackConfig, blueprint })).toStrictEqual({})
  })

  test("data defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({ data: { example: true } })
    const blueprint = undefined

    expect(buildData({ stackGroup, stackConfig, blueprint })).toStrictEqual({
      example: true,
    })
  })

  test("data defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      data: { regions: ["eu-central-1", "us-east1"] },
    })

    expect(buildData({ stackGroup, stackConfig, blueprint })).toStrictEqual({
      regions: ["eu-central-1", "us-east1"],
    })
  })

  test("data defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      data: { person: { age: 10 }, code: 123 },
    })
    const blueprint = createStackConfig({
      data: { person: { name: "Jalmar", age: 9 } },
    })

    expect(buildData({ stackGroup, stackConfig, blueprint })).toStrictEqual({
      person: { name: "Jalmar", age: 10 },
      code: 123,
    })
  })

  test("data defined in stack group", () => {
    const stackGroup = createStackGroup({
      data: { foo: { bar: 10 } },
    })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildData({ stackGroup, stackConfig, blueprint })).toStrictEqual({
      foo: { bar: 10 },
    })
  })

  test("data defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup({
      data: { code: 1, regions: ["eu-west-1"], person: { license: "none" } },
    })
    const stackConfig = createStackConfig({
      data: { person: { age: 10 }, code: 123 },
    })
    const blueprint = createStackConfig({
      data: { person: { name: "Jalmar", age: 9 } },
    })

    expect(buildData({ stackGroup, stackConfig, blueprint })).toStrictEqual({
      person: { name: "Jalmar", age: 10, license: "none" },
      code: 123,
      regions: ["eu-west-1"],
    })
  })
})
