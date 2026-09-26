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

  test("deployment config is accepted", () => {
    const value = {
      regions: "eu-west-1",
      deploymentConfig: { mode: "EXPRESS", disableRollback: false },
    }
    expect(schema.validate(value)).toStrictEqual({ value })
  })

  test("unknown deployment config property is rejected", () => {
    expect(
      schema.validate({
        regions: "eu-west-1",
        deploymentConfig: { rollback: false },
      }).error?.message,
    ).toStrictEqual('"deploymentConfig.rollback" is not allowed')
  })
})
