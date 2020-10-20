import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/unit-test"
import Joi from "joi"
import { SecretResolverProvider } from "../src/impl/secret-resolver"
import { defaultSchema } from "../src/resolver-registry"

const provider = new SecretResolverProvider()

describe("SecretResolverProvider", () => {
  test("#name should be static", () => {
    expect(provider.name).toBe("secret")
  })
  describe("#schema validation", () => {
    const schema = provider.schema(
      Joi.defaults((schema) => schema),
      defaultSchema("secret"),
    )

    test("should succeed when a valid configuration is given", () => {
      expectNoValidationError(schema)({
        stack: "/dev.yml",
        secret: "mySecret",
      })
    })

    test("should succeed when a valid configuration and confidential is given", () => {
      expectNoValidationError(schema)({
        stack: "/dev.yml",
        secret: "mySecret",
        confidential: true,
      })
    })

    test("should succeed when a valid configuration with stack omitted is given", () => {
      expectNoValidationError(schema)({
        secret: "mySecret",
      })
    })

    test("should fail when a stack is invalid", () => {
      expectValidationErrors(schema)(
        { secret: "passwrod", stack: "sdkjasdj" },
        '"stack" with value "sdkjasdj" fails to match the required pattern: /^(\\/[a-zA-Z][a-zA-Z0-9-]*)+\\.yml\\/?/',
      )
    })
  })
})
