import { createStackConfigSchema } from "../../../src/schema/stack-config-schema"

const schema = createStackConfigSchema({
  regions: ["eu-west-1"],
  configType: "stack",
})

describe("stack config file schema", () => {
  test("regions is the only required property", () => {
    expect(schema.validate({ regions: "eu-west-1" })).toStrictEqual({
      value: {
        regions: "eu-west-1",
      },
    })
  })
})
