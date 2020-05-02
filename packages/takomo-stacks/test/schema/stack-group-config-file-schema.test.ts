import { stackGroupConfigFileSchema as schema } from "../../src/config/schema"

describe("stack group config file schema", () => {
  test("all properties are optional", () => {
    expect(schema.validate({})).toStrictEqual({ value: {} })
  })
})
