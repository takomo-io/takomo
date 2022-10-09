import { buildRegions } from "../../../src/takomo-stacks-context/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildRegions", () => {
  test("regions defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({ regions: ["eu-west-1"] })
    const blueprint = undefined

    expect(buildRegions({ stackGroup, stackConfig, blueprint })).toStrictEqual([
      "eu-west-1",
    ])
  })

  test("regions defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      regions: ["eu-central-1", "us-east1"],
    })

    expect(buildRegions({ stackGroup, stackConfig, blueprint })).toStrictEqual([
      "eu-central-1",
      "us-east1",
    ])
  })

  test("regions defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      regions: ["eu-west-1"],
    })
    const blueprint = createStackConfig({
      regions: ["eu-central-1", "us-east1"],
    })

    expect(buildRegions({ stackGroup, stackConfig, blueprint })).toStrictEqual([
      "eu-west-1",
    ])
  })

  test("regions defined in stack group", () => {
    const stackGroup = createStackGroup({
      regions: ["eu-north-1", "us-east-1"],
    })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildRegions({ stackGroup, stackConfig, blueprint })).toStrictEqual([
      "eu-north-1",
      "us-east-1",
    ])
  })
})
