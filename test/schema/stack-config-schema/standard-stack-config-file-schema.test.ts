import { createStandardStackConfigSchema } from "../../../src/schema/standard-stack-config-schema.js"

const schema = createStandardStackConfigSchema({
  regions: ["eu-west-1"],
  configType: "stack",
})

describe("standard stack config file schema", () => {
  test("regions is the only required property", () => {
    expect(schema.validate({ regions: "eu-west-1" })).toStrictEqual({
      value: {
        regions: "eu-west-1",
      },
    })
  })
})
