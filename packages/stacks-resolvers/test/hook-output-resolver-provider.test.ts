import { CommandContext } from "@takomo/core"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/test-unit"
import { mock } from "jest-mock-extended"
import Joi from "joi"
import { createHookOutputResolverProvider } from "../src/hook-output-resolver"
import { defaultSchema } from "../src/resolver-registry"

const provider = createHookOutputResolverProvider()

const schema = provider.schema!({
  ctx: mock<CommandContext>({ regions: ["us-east-1"] }),
  joi: Joi.defaults((schema) => schema),
  base: defaultSchema("hook-output"),
})

describe("FileContentsResolverProvider", () => {
  test("#name should be hook-output", () => {
    expect(provider.name).toBe("hook-output")
  })
  describe("#schema validation", () => {
    test("should succeed when a valid configuration is given", () => {
      expectNoValidationError(schema)({
        hook: "hooky",
      })
    })

    test("should fail when a configuration with missing hook is given", () => {
      expectValidationErrors(schema)({}, '"hook" is required')
    })

    test("should fail when a configuration with hook with invalid type is given", () => {
      expectValidationErrors(schema)({ hook: 100 }, '"hook" must be a string')
    })

    test("should succeed when confidential property is given", () => {
      expectNoValidationError(schema)({
        hook: "hookey",
        confidential: true,
      })
    })

    test("should succeed when immutable property is given", () => {
      expectNoValidationError(schema)({
        hook: "hookey",
        immutable: true,
      })
    })

    test("should succeed when all supported properties are given", () => {
      expectNoValidationError(schema)({
        hook: "hookey",
        immutable: true,
        confidential: false,
      })
    })
  })
})
