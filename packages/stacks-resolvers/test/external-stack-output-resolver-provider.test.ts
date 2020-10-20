import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/unit-test"
import Joi from "joi"
import { ExternalStackOutputResolverProvider } from "../src/impl/external-stack-output-resolver"
import { defaultSchema } from "../src/resolver-registry"

const provider = new ExternalStackOutputResolverProvider()

describe("ExternalStackOutputResolverProvider", () => {
  test("#name should be external-stack-output", () => {
    expect(provider.name).toBe("external-stack-output")
  })
  describe("#schema validation", () => {
    const schema = provider.schema(
      Joi.defaults((schema) => schema),
      defaultSchema("external-stack-output"),
    )

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
        '"region" must be one of [af-south-1, ap-east-1, ap-northeast-1, ap-northeast-2, ap-northeast-3, ap-south-1, ap-southeast-1, ap-southeast-2, ca-central-1, cn-north-1, cn-northwest-1, eu-central-1, eu-north-1, eu-south-1, eu-west-1, eu-west-2, eu-west-3, me-south-1, sa-east-1, us-east-1, us-east-2, us-gov-east-1, us-west-1, us-west-2]',
      )
    })
  })
})
