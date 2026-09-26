import { createStackGroupConfigSchema } from "../../../src/schema/stack-group-config-schema.js"

const schema = createStackGroupConfigSchema({ regions: ["eu-central-1"] })

describe("stack group config file schema", () => {
  test("all properties are optional", () => {
    expect(schema.validate({})).toStrictEqual({ value: {} })
  })

  test("deployment config is accepted", () => {
    const value = {
      deploymentConfig: { mode: "EXPRESS", disableRollback: true },
    }
    expect(schema.validate(value)).toStrictEqual({ value })
  })

  test("invalid deployment mode is rejected", () => {
    expect(
      schema.validate({ deploymentConfig: { mode: "FAST" } }).error?.message,
    ).toStrictEqual(
      '"deploymentConfig.mode" must be one of [STANDARD, EXPRESS]',
    )
  })
})
