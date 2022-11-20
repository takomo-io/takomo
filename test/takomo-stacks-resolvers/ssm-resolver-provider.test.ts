import { mock } from "jest-mock-extended"
import Joi from "joi"
import { CommandContext, TakomoProjectConfig } from "../../src/takomo-core"
import { defaultSchema } from "../../src/takomo-stacks-resolvers/resolver-registry"
import { createSsmResolverProvider } from "../../src/takomo-stacks-resolvers/ssm-resolver"
import { expectNoValidationError, expectValidationErrors } from "../assertions"

const provider = createSsmResolverProvider()

const ctx: CommandContext = {
  projectDir: "",
  autoConfirmEnabled: true,
  regions: ["eu-west-1", "eu-north-1"],
  logLevel: "info",
  quiet: false,
  outputFormat: "text",
  resetCache: true,
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
  base: defaultSchema("ssm"),
})

describe("SsmResolverProvider", () => {
  test("#name should be ssm", () => {
    expect(provider.name).toBe("ssm")
  })
  describe("#schema validation", () => {
    test("should succeed when a valid configuration is given", () => {
      expectNoValidationError(schema)({
        name: "param-name",
        region: "eu-west-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
      })
    })

    test("should succeed when a valid configuration and confidential is given", () => {
      expectNoValidationError(schema)({
        name: "/param/name/nested",
        region: "eu-north-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
        confidential: true,
      })
    })

    test("should succeed when a valid configuration and immutable is given", () => {
      expectNoValidationError(schema)({
        name: "/param/name/Nested",
        region: "eu-north-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
        immutable: true,
      })
    })

    test("should succeed when a valid configuration with all supported properties is given", () => {
      expectNoValidationError(schema)({
        name: "/param/name/nested",
        region: "eu-north-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
        immutable: true,
        confidential: true,
      })
    })

    test("should fail when name is missing", () => {
      expectValidationErrors(schema)(
        {
          region: "eu-north-1",
        },
        '"name" is required',
      )
    })

    test("should fail when name is invalid", () => {
      expectValidationErrors(schema)(
        { name: "in valid" },
        '"name" with value "in valid" fails to match the required pattern: /^[a-zA-Z0-9_.\\-/]+$/',
      )
    })

    test("should fail when region is invalid", () => {
      expectValidationErrors(schema)(
        { region: "in valid", name: "x" },
        '"region" must be one of [eu-west-1, eu-north-1]',
      )
    })
  })
})
