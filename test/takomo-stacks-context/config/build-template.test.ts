import { buildTemplate } from "../../../src/takomo-stacks-context/config/build-standard-stack.js"
import { createStackConfig, createStackGroup } from "../helpers.js"

const stackGroup = createStackGroup()

describe("#buildTemplate", () => {
  test("no template at all", () => {
    const stackConfig = createStackConfig()
    const blueprint = undefined
    const stackPath = "/dev.yml"

    expect(
      buildTemplate({ stackConfig, blueprint, stackGroup }, stackPath),
    ).toStrictEqual({
      dynamic: true,
      filename: "dev.yml",
    })
  })
  test("stack config has template", () => {
    const stackConfig = createStackConfig({
      template: { filename: "my_template.yml", dynamic: true },
    })
    const blueprint = undefined
    const stackPath = "/dev.yml"

    expect(
      buildTemplate({ stackConfig, blueprint, stackGroup }, stackPath),
    ).toStrictEqual({
      filename: "my_template.yml",
      dynamic: true,
    })
  })
  test("blueprint has template", () => {
    const stackConfig = createStackConfig()
    const blueprint = createStackConfig({
      template: { inline: "xxx", dynamic: false },
    })
    const stackPath = "/dev.yml"

    expect(
      buildTemplate({ stackConfig, blueprint, stackGroup }, stackPath),
    ).toStrictEqual({
      inline: "xxx",
      dynamic: false,
    })
  })
  test("stack config and blueprint have template", () => {
    const stackConfig = createStackConfig({
      template: { inline: "yyy", dynamic: true },
    })
    const blueprint = createStackConfig({
      template: { inline: "xxx", dynamic: false },
    })
    const stackPath = "/dev.yml"

    expect(
      buildTemplate({ stackConfig, blueprint, stackGroup }, stackPath),
    ).toStrictEqual({
      inline: "yyy",
      dynamic: true,
    })
  })
})
