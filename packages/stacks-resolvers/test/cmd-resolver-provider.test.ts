import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/unit-test"
import Joi from "joi"
import { CmdResolverProvider } from "../src/impl/cmd-resolver"

const provider = new CmdResolverProvider()

describe("CmdResolverProvider", () => {
  test("#name should be cmd", () => {
    expect(provider.name).toBe("cmd")
  })
  describe("#schema validation", () => {
    const schema = provider.schema(
      Joi.defaults((schema) => schema),
      Joi.object(),
    )

    test("should succeed when a valid configuration is given", () => {
      expectNoValidationError(schema)({
        command: "echo 'Hello'",
      })
    })

    test("should fail when a configuration with missing command is given", () => {
      expectValidationErrors(schema)({}, '"command" is required')
    })

    test("should fail when a configuration with command with invalid type is given", () => {
      expectValidationErrors(schema)(
        { command: 100 },
        '"command" must be a string',
      )
    })
  })
})
