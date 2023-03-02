import { mock } from "jest-mock-extended"
import Joi from "joi"
import { defaultSchema } from "../../src/resolvers/resolver-registry.js"
import { createStackOutputResolverProvider } from "../../src/resolvers/stack-output-resolver.js"
import { CommandContext, TakomoProjectConfig } from "../../src/takomo-core.js"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../assertions.js"

const provider = createStackOutputResolverProvider()

const ctx: CommandContext = {
  projectDir: "",
  autoConfirmEnabled: true,
  regions: ["eu-west-1"],
  logLevel: "info",
  quiet: false,
  resetCache: false,
  outputFormat: "text",
  variables: {
    var: {},
    env: {},
    context: {
      projectDir: "",
    },
  },
  confidentialValuesLoggingEnabled: false,
  statisticsEnabled: true,
  iamGeneratePoliciesInstructionsEnabled: false,
  credentials: undefined,
  projectConfig: mock<TakomoProjectConfig>(),
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
        '"stack" with value "sdkjasdj" fails to match the required pattern: /^(((\\/|(\\.\\.\\/)+)?)[a-zA-Z][a-zA-Z0-9-]*)+\\.yml\\/?/',
      )
    })
  })
})
