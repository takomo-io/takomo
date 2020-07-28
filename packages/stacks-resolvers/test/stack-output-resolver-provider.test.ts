import Joi from "@hapi/joi"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/unit-test"
import { StackOutputResolverProvider } from "../src/impl/stack-output-resolver"

const provider = new StackOutputResolverProvider()

describe("StackOutputResolverProvider", () => {
  test("#name should be stack-output", () => {
    expect(provider.name).toBe("stack-output")
  })
  describe("#schema validation", () => {
    const schema = provider.schema(
      Joi.defaults((schema) => schema),
      Joi.object(),
    )

    test("should succeed when a valid configuration is given", () => {
      expectNoValidationError(schema)({
        stack: "/dev.yml",
        output: "myOutput",
      })
    })

    test("should fail when a stack is missing", () => {
      expectValidationErrors(schema)(
        {
          output: "myOutput",
        },
        '"stack" is required',
      )
    })

    test("should fail when a output is missing", () => {
      expectValidationErrors(schema)(
        {
          stack: "/network.yml",
        },
        '"output" is required',
      )
    })

    test("should fail when a stack is invalid", () => {
      expectValidationErrors(schema)(
        { output: "foo", stack: "sdkjasdj" },
        '"stack" with value "sdkjasdj" fails to match the required pattern: /^(\\/[a-zA-Z][a-zA-Z0-9-]*)+\\.yml\\/?/',
      )
    })
  })
})
