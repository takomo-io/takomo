import Joi from "@hapi/joi"
import { StaticResolverProvider } from "../src/impl/static-resolver"
import { expectNoValidationError, expectValidationErrors } from "./helpers"

const provider = new StaticResolverProvider()

describe("StaticResolverProvider", () => {
  test("#name should be static", () => {
    expect(provider.name).toBe("static")
  })
  describe("#schema validation", () => {
    const schema = provider.schema(
      Joi.defaults((schema) => schema),
      Joi.object(),
    )

    test("should succeed when a valid configuration with a string value is given", () => {
      expectNoValidationError(schema)({
        value: "string",
      })
    })

    test("should succeed when a valid configuration with a number value is given", () => {
      expectNoValidationError(schema)({
        value: 9999,
      })
    })

    test("should succeed when a valid configuration with a boolean value is given", () => {
      expectNoValidationError(schema)({
        value: true,
      })
    })

    test("should succeed when a valid configuration with an array value is given", () => {
      expectNoValidationError(schema)({
        value: ["string", 123, false],
      })
    })

    test("should fail when a value is missing", () => {
      expectValidationErrors(schema)({}, '"value" is required')
    })

    test("should fail when a value is an object", () => {
      expectValidationErrors(schema)(
        { value: {} },
        '"value" must be one of [string, number, boolean, array]',
      )
    })

    test("should fail when a value is an empty array", () => {
      expectValidationErrors(schema)(
        { value: [] },
        '"value" must contain at least 1 items',
      )
    })
  })
})
