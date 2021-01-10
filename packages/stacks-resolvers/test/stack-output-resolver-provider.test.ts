import { CommandContext } from "@takomo/core"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/test-unit"
import Joi from "joi"
import { defaultSchema } from "../src/resolver-registry"
import { createStackOutputResolverProvider } from "../src/stack-output-resolver"

const provider = createStackOutputResolverProvider()

const ctx: CommandContext = {
  projectDir: "",
  autoConfirmEnabled: true,
  regions: ["eu-west-1"],
  organizationServicePrincipals: [],
  logLevel: "info",
  variables: {
    var: {},
    env: {},
    context: {
      projectDir: "",
    },
  },
  confidentialValuesLoggingEnabled: false,
  statisticsEnabled: true,
}

const schema = provider.schema!({
  ctx,
  joi: Joi.defaults((schema) => schema),
  base: defaultSchema("stack-output"),
})

describe("StackOutputResolverProvider", () => {
  test("#name should be stack-output", () => {
    expect(provider.name).toBe("stack-output")
  })
  describe("#schema validation", () => {
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

    test("should succeed when a valid configuration and immutable is given", () => {
      expectNoValidationError(schema)({
        stack: "/dev.yml",
        output: "myOutput",
        immutable: true,
      })
    })

    test("should succeed when a valid configuration with all supported properties is given", () => {
      expectNoValidationError(schema)({
        stack: "/dev.yml",
        output: "myOutput",
        immutable: true,
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
