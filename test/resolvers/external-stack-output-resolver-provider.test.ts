import { mock } from "jest-mock-extended"
import Joi from "joi"
import { createExternalStackOutputResolverProvider } from "../../src/resolvers/external-stack-output-resolver.js"
import { defaultSchema } from "../../src/resolvers/resolver-registry.js"
import { CommandContext, TakomoProjectConfig } from "../../src/takomo-core.js"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../assertions.js"

const provider = createExternalStackOutputResolverProvider()

const ctx: CommandContext = {
  projectDir: "",
  autoConfirmEnabled: true,
  regions: ["eu-west-1"],
  logLevel: "info",
  quiet: false,
  outputFormat: "text",
  variables: {
    var: {},
    env: {},
    context: {
      projectDir: "",
    },
  },
  resetCache: false,
  confidentialValuesLoggingEnabled: false,
  statisticsEnabled: true,
  iamGeneratePoliciesInstructionsEnabled: false,
  credentials: undefined,
  projectConfig: mock<TakomoProjectConfig>(),
}

const schema = provider.schema!({
  ctx,
  joi: Joi.defaults((schema) => schema),
  base: defaultSchema("external-stack-output"),
})

describe("ExternalStackOutputResolverProvider", () => {
  test("#name should be external-stack-output", () => {
    expect(provider.name).toBe("external-stack-output")
  })
  describe("#schema validation", () => {
    test("should succeed when a valid configuration is given", () => {
      expectNoValidationError(schema)({
        stack: "database",
        output: "subnetId",
        region: "eu-west-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
      })
    })

    test("should succeed when a valid configuration and confidential is given", () => {
      expectNoValidationError(schema)({
        stack: "database",
        output: "subnetId",
        region: "eu-west-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
        confidential: false,
      })
    })

    test("should succeed when a valid configuration and immutable is given", () => {
      expectNoValidationError(schema)({
        stack: "database",
        output: "subnetId",
        region: "eu-west-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
        immutable: false,
      })
    })

    test("should succeed when a valid configuration with all supported properties is given", () => {
      expectNoValidationError(schema)({
        stack: "database",
        output: "subnetId",
        region: "eu-west-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
        immutable: true,
        confidential: false,
      })
    })

    test("should succeed when a valid configuration is given and optional properties are omitted", () => {
      expectNoValidationError(schema)({
        stack: "database",
        output: "subnetId",
      })
    })

    test("should fail when stack is invalid", () => {
      expectValidationErrors(schema)(
        { output: "baz", stack: "/sdkjasdj.yml" },
        '"stack" with value "/sdkjasdj.yml" fails to match the required pattern: /^[a-zA-Z][a-zA-Z0-9-]*$/',
      )
    })

    test("should fail when commandRole is invalid", () => {
      expectValidationErrors(schema)(
        {
          stack: "database",
          output: "subnetId",
          region: "eu-west-1",
          commandRole: "xxxxx",
        },
        '"commandRole" with value "xxxxx" fails to match the required pattern: /^arn:aws:iam::\\d{12}:role\\/.+$/',
      )
    })

    test("should fail when region is invalid", () => {
      expectValidationErrors(schema)(
        {
          stack: "database",
          output: "subnetId",
          region: "sassax",
        },
        '"region" must be [eu-west-1]',
      )
    })
  })
})
