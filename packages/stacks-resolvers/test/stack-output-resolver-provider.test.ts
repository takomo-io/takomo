import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/unit-test"
import Joi from "joi"
import { StackOutputResolverProvider } from "../src/impl/stack-output-resolver"
import { defaultSchema } from "../src/resolver-registry"

const provider = new StackOutputResolverProvider()

describe("StackOutputResolverProvider", () => {
  test("#name should be stack-output", () => {
    expect(provider.name).toBe("stack-output")
  })
  describe("#schema validation", () => {
    const schema = provider.schema(
      Joi.defaults((schema) => schema),
      defaultSchema("stack-output"),
    )

    test("should succeed when a valid configuration is given", () => {
      expectNoValidationError(schema)({
        stack: "/dev.yml",
        output: "myOutput",
      })
    })

    test("should succeed when a valid configuration and confidential is given", () => {
      expectNoValidationError(schema)({
        stack: "/dev.yml",
        output: "myOutput",
        confidential: true,
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
