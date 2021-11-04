import { AwsClientProvider } from "@takomo/aws-clients/src"
import { CommandContext, TakomoProjectConfig } from "@takomo/core"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/test-unit"
import { mock } from "jest-mock-extended"
import Joi from "joi"
import { defaultSchema } from "../src/resolver-registry"
import { createSecretResolverProvider } from "../src/secret-resolver"

const provider = createSecretResolverProvider()

const ctx: CommandContext = {
  projectDir: "",
  autoConfirmEnabled: true,
  regions: ["eu-west-1", "eu-north-1"],
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
  confidentialValuesLoggingEnabled: false,
  statisticsEnabled: true,
  iamGeneratePoliciesInstructionsEnabled: false,
  credentials: undefined,
  projectConfig: mock<TakomoProjectConfig>(),
  awsClientProvider: mock<AwsClientProvider>(),
}

const schema = provider.schema!({
  ctx,
  joi: Joi.defaults((schema) => schema),
  base: defaultSchema("secret"),
})

describe("SecretResolverProvider", () => {
  test("#name should be secret", () => {
    expect(provider.name).toBe("secret")
  })
  describe("#schema validation", () => {
    test("should succeed when a valid configuration is given", () => {
      expectNoValidationError(schema)({
        secretId: "MySecret",
        region: "eu-north-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
      })
    })

    test("should succeed when a valid configuration and confidential is given", () => {
      expectNoValidationError(schema)({
        secretId: "Another",
        region: "eu-north-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
        confidential: true,
      })
    })

    test("should succeed when a valid configuration and immutable is given", () => {
      expectNoValidationError(schema)({
        secretId: "Code",
        region: "eu-north-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
        immutable: true,
      })
    })

    test("should succeed when a valid configuration with all supported properties are given", () => {
      expectNoValidationError(schema)({
        secretId: "Code",
        region: "eu-north-1",
        commandRole: "arn:aws:iam::123456789012:role/admin",
        versionId: "121",
        versionStage: "121",
        query: "value.other",
        immutable: true,
        confidential: true,
      })
    })

    test("should fail when secretId is missing", () => {
      expectValidationErrors(schema)(
        {
          region: "eu-north-1",
        },
        '"secretId" is required',
      )
    })

    test("should fail when region is invalid", () => {
      expectValidationErrors(schema)(
        { region: "in valid", secretId: "MySecret" },
        '"region" must be one of [eu-west-1, eu-north-1]',
      )
    })
  })
})
