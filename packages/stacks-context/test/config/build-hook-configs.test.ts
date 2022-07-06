import { buildHookConfigs } from "../../dist/config/build-stack"
import { createStackConfig, createStackGroup } from "../helpers"

describe("#buildHookConfigs", () => {
  test("no hooks", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildHookConfigs({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([])
  })

  test("hooks defined in stack config", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      hooks: [
        {
          name: "hook1",
          type: "cmd",
        },
      ],
    })
    const blueprint = undefined

    expect(
      buildHookConfigs({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([
      {
        name: "hook1",
        type: "cmd",
      },
    ])
  })

  test("hooks defined in blueprint", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      hooks: [
        {
          name: "hook2",
          type: "cmd",
        },
      ],
    })

    expect(
      buildHookConfigs({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([
      {
        name: "hook2",
        type: "cmd",
      },
    ])
  })

  test("hooks defined in stack group", () => {
    const stackGroup = createStackGroup({
      hooks: [
        {
          name: "hook3",
          type: "cmd",
        },
      ],
    })
    const stackConfig = createStackConfig()
    const blueprint = undefined

    expect(
      buildHookConfigs({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([
      {
        name: "hook3",
        type: "cmd",
      },
    ])
  })

  test("hooks defined in stack group and stack", () => {
    const stackGroup = createStackGroup({
      hooks: [
        {
          name: "hook4",
          type: "cmd",
        },
      ],
    })
    const stackConfig = createStackConfig({
      hooks: [
        {
          name: "hook5",
          type: "cmd",
        },
      ],
    })
    const blueprint = undefined

    expect(
      buildHookConfigs({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([
      {
        name: "hook4",
        type: "cmd",
      },
      {
        name: "hook5",
        type: "cmd",
      },
    ])
  })

  test("hooks defined in blueprint and stack", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      hooks: [
        {
          name: "hook7",
          type: "cmd",
        },
      ],
    })
    const blueprint = createStackConfig({
      hooks: [
        {
          name: "hook6",
          type: "cmd",
        },
      ],
    })

    expect(
      buildHookConfigs({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([
      {
        name: "hook6",
        type: "cmd",
      },
      {
        name: "hook7",
        type: "cmd",
      },
    ])
  })

  test("hooks defined in stack group and blueprint", () => {
    const stackGroup = createStackGroup({
      hooks: [
        {
          name: "hook3",
          type: "cmd",
        },
      ],
    })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      hooks: [
        {
          name: "hook4",
          type: "cmd",
        },
      ],
    })

    expect(
      buildHookConfigs({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([
      {
        name: "hook3",
        type: "cmd",
      },
      {
        name: "hook4",
        type: "cmd",
      },
    ])
  })

  //

  test("hooks defined in stack group and stack with overriding hooks", () => {
    const stackGroup = createStackGroup({
      hooks: [
        {
          name: "hook4",
          type: "cmd",
        },
        {
          name: "hook5",
          type: "cmd",
        },
      ],
    })
    const stackConfig = createStackConfig({
      hooks: [
        {
          name: "hook5",
          type: "other",
        },
        {
          name: "hook6",
          type: "example",
        },
      ],
    })
    const blueprint = undefined

    expect(
      buildHookConfigs({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([
      {
        name: "hook4",
        type: "cmd",
      },
      {
        name: "hook5",
        type: "other",
      },
      {
        name: "hook6",
        type: "example",
      },
    ])
  })

  test("hooks defined in blueprint and stack with overriding hooks", () => {
    const stackGroup = createStackGroup()
    const stackConfig = createStackConfig({
      hooks: [
        {
          name: "hook7",
          type: "cmd",
        },
        {
          name: "hook8",
          type: "cmd",
        },
      ],
    })
    const blueprint = createStackConfig({
      hooks: [
        {
          name: "hook9",
          type: "cmd",
        },
        {
          name: "hook7",
          type: "example",
        },
      ],
    })

    expect(
      buildHookConfigs({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([
      {
        name: "hook9",
        type: "cmd",
      },
      {
        name: "hook7",
        type: "cmd",
      },
      {
        name: "hook8",
        type: "cmd",
      },
    ])
  })

  test("hooks defined in stack group and blueprint with overriding hooks", () => {
    const stackGroup = createStackGroup({
      hooks: [
        {
          name: "hook3",
          type: "cmd",
        },
        {
          name: "hook4",
          type: "cmd",
        },
      ],
    })
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      hooks: [
        {
          name: "hook3",
          type: "run",
        },
      ],
    })

    expect(
      buildHookConfigs({ stackGroup, stackConfig, blueprint }),
    ).toStrictEqual([
      {
        name: "hook3",
        type: "run",
      },
      {
        name: "hook4",
        type: "cmd",
      },
    ])
  })
})
