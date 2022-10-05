import { mock } from "jest-mock-extended"
import Joi from "joi"
import { CommandContext } from "../../src/takomo-core"
import { defaultSchema } from "../../src/takomo-stacks-resolvers/resolver-registry"
import { createStaticResolverProvider } from "../../src/takomo-stacks-resolvers/static-resolver"
import { expectNoValidationError, expectValidationErrors } from "../assertions"

const provider = createStaticResolverProvider()

const schema = provider.schema!({
  ctx: mock<CommandContext>(),
  joi: Joi.defaults((schema) => schema),
  base: defaultSchema("static"),
})

describe("StaticResolverProvider", () => {
  test("#name should be static", () => {
    expect(provider.name).toBe("static")
  })
  describe("#schema validation", () => {
    test("should succeed when a valid configuration with a string value is given", () => {
      expectNoValidationError(schema)({
        value: "string",
      })
    })

    test("should succeed when a valid configuration with an empty value is given", () => {
      expectNoValidationError(schema)({
        value: "",
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

    test("should succeed when a valid configuration with confidential is given", () => {
      expectNoValidationError(schema)({
        value: 9999,
        confidential: false,
      })
    })

    test("should succeed when a valid configuration with immutable is given", () => {
      expectNoValidationError(schema)({
        value: 9999,
        immutable: false,
      })
    })

    test("should succeed when a valid configuration when all supported properties is given", () => {
      expectNoValidationError(schema)({
        value: 9999,
        immutable: false,
        confidential: true,
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
