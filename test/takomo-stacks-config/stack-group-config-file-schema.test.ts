import { createStackGroupConfigSchema } from "../../src/takomo-stacks-config/schema"

const schema = createStackGroupConfigSchema({ regions: ["eu-central-1"] })

describe("stack group config file schema", () => {
  test("all properties are optional", () => {
    expect(schema.validate({})).toStrictEqual({ value: {} })
  })
})
