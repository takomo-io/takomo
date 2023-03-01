import { buildTags } from "../../../src/takomo-stacks-context/config/build-stack.js"
import { createStackConfig, createStackGroup } from "../helpers.js"

describe("#buildTags", () => {
  test("no tags", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildTags({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      new Map(),
    )
  })

  test("tags defined in stack group", () => {
    const stackGroup = createStackGroup({ tags: new Map([["a", "b"]]) })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(buildTags({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      new Map([["a", "b"]]),
    )
  })

  test("tags defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      tags: new Map([
        ["a", "b"],
        ["c", "d"],
      ]),
    })

    expect(buildTags({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      new Map([
        ["a", "b"],
        ["c", "d"],
      ]),
    )
  })

  test("tags defined in blueprint and stack group", () => {
    const stackGroup = createStackGroup({
      tags: new Map([
        ["a", "b"],
        ["c", "d"],
      ]),
    })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      tags: new Map([
        ["a", "e"],
        ["e", "f"],
      ]),
    })

    expect(buildTags({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      new Map([
        ["a", "e"],
        ["c", "d"],
        ["e", "f"],
      ]),
    )
  })

  test("tags defined in blueprint and stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      tags: new Map([
        ["a", "e"],
        ["c", "d"],
        ["e", "f"],
      ]),
    })
    const blueprint = createStackConfig({
      tags: new Map([
        ["a", "foo"],
        ["hello", "world"],
      ]),
    })

    expect(buildTags({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      new Map([
        ["a", "e"],
        ["c", "d"],
        ["e", "f"],
        ["hello", "world"],
      ]),
    )
  })

  test("tags defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      tags: new Map([
        ["a", "e"],
        ["c", "d"],
        ["e", "f"],
      ]),
    })
    const blueprint = createStackConfig()

    expect(buildTags({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      new Map([
        ["a", "e"],
        ["c", "d"],
        ["e", "f"],
      ]),
    )
  })

  test("tags defined in blueprint and stack group but inheritTags is false in blueprint", () => {
    const stackGroup = createStackGroup({
      tags: new Map([
        ["a", "b"],
        ["c", "d"],
      ]),
    })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      inheritTags: false,
      tags: new Map([
        ["a", "e"],
        ["e", "f"],
      ]),
    })

    expect(buildTags({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      new Map([
        ["a", "e"],
        ["e", "f"],
      ]),
    )
  })

  test("tags defined in blueprint and stack group but inheritTags is false in stack config", () => {
    const stackGroup = createStackGroup({
      tags: new Map([
        ["a", "b"],
        ["c", "d"],
      ]),
    })
    const stackConfig = createStackConfig({ inheritTags: false })
    const blueprint = createStackConfig({
      tags: new Map([
        ["a", "e"],
        ["e", "f"],
      ]),
    })

    expect(buildTags({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      new Map([
        ["a", "e"],
        ["e", "f"],
      ]),
    )
  })

  test("tags defined in blueprint and stack group but inheritTags is false in stack config and true in blueprint", () => {
    const stackGroup = createStackGroup({
      tags: new Map([
        ["a", "b"],
        ["c", "d"],
      ]),
    })
    const stackConfig = createStackConfig({ inheritTags: false })
    const blueprint = createStackConfig({
      inheritTags: true,
      tags: new Map([
        ["a", "e"],
        ["e", "f"],
      ]),
    })

    expect(buildTags({ stackGroup, stackConfig, blueprint })).toStrictEqual(
      new Map([
        ["a", "e"],
        ["e", "f"],
      ]),
    )
  })
})
