import { CommandContext } from "@takomo/core"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/test-unit"
import { mock } from "jest-mock-extended"
import Joi from "joi"
import { createCmdResolverProvider } from "../src/cmd-resolver"
import { defaultSchema } from "../src/resolver-registry"

const provider = createCmdResolverProvider()

const schema = provider.schema!({
  ctx: mock<CommandContext>(),
  joi: Joi.defaults((schema) => schema),
  base: defaultSchema("cmd"),
})

describe("CmdResolverProvider", () => {
  test("#name should be cmd", () => {
    expect(provider.name).toBe("cmd")
  })
  describe("#schema validation", () => {
    test("should succeed when a minimum valid configuration is given", () => {
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

    test("should succeed when confidential property is given", () => {
      expectNoValidationError(schema)({
        command: "echo cool",
        confidential: true,
      })
    })

    test("should succeed when immutable property is given", () => {
      expectNoValidationError(schema)({
        command: "echo cool",
        immutable: true,
      })
    })

    test("should succeed when cwd property is given", () => {
      expectNoValidationError(schema)({
        command: "echo cool",
        cwd: "/home/user",
      })
    })

    test("should succeed when exposeStackRegion property is given", () => {
      expectNoValidationError(schema)({
        command: "echo cool",
        exposeStackRegion: false,
      })
    })

    test("should succeed when exposeStackCredentials property is given", () => {
      expectNoValidationError(schema)({
        command: "echo cool",
        exposeStackCredentials: true,
      })
    })

    test("should succeed when all supported properties are given", () => {
      expectNoValidationError(schema)({
        command: "echo cool",
        immutable: true,
        confidential: false,
        cwd: "/tmp",
        exposeStackRegion: true,
        exposeStackCredentials: true,
      })
    })
  })
})
