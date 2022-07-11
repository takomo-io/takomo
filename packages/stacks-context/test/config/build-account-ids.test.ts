import { buildAccountIds } from "../../src/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildAccountIds", () => {
  test("no account ids defined", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildAccountIds({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([])
  })

  test("account ids defined in stack group", () => {
    const stackGroup = createStackGroup({ accountIds: ["123456789012"] })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildAccountIds({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(["123456789012"])
  })

  test("account ids defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ accountIds: ["123456789011"] })

    expect(
      buildAccountIds({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(["123456789011"])
  })

  test("account ids defined in blueprint and stack group", () => {
    const stackGroup = createStackGroup({ accountIds: ["000000000000"] })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({ accountIds: ["123456789013"] })

    expect(
      buildAccountIds({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(["123456789013"])
  })

  test("account ids defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({ accountIds: ["000000000000"] })
    const blueprint = createStackConfig({ accountIds: ["123456789013"] })

    expect(
      buildAccountIds({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(["000000000000"])
  })

  test("account ids defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      accountIds: ["999999999999", "888888888888"],
    })
    const blueprint = createStackConfig()

    expect(
      buildAccountIds({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual(["999999999999", "888888888888"])
  })
})
