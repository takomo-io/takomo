import { createStackGroupConfigSchema } from "../../../src/schema/stack-group-config-schema.js"

const schema = createStackGroupConfigSchema({ regions: ["eu-central-1"] })

describe("stack group config file schema", () => {
  test("all properties are optional", () => {
    expect(schema.validate({})).toStrictEqual({ value: {} })
  })
})
