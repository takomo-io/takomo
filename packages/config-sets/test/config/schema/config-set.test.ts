import { configSet } from "../../../src/config/schema"
import { expectNoValidationError } from "../../helpers"

describe("config set validation", () => {
  describe("should succeed when", () => {
    test("a valid minimum config set is given", () => {
      expectNoValidationError(configSet)({
        description: "my config set",
        commandPaths: ["/path"],
      })
    })
    test("a valid config set with vars is given", () => {
      expectNoValidationError(configSet)({
        description: "my config set",
        commandPaths: ["/path"],
        vars: {
          hello: "world",
          code: 123,
          array: ["a", "b"],
          obj: {
            name: "zorro",
          },
        },
      })
    })
    test("a valid config set with projectDir is given", () => {
      expectNoValidationError(configSet)({
        description: "my config set",
        commandPaths: ["/path"],
        projectDir: "/tmp",
      })
    })
    test("a valid full config set is given", () => {
      expectNoValidationError(configSet)({
        description: "my config set",
        commandPaths: ["/path", "/another"],
        projectDir: "/tmp",
        vars: {
          hello: "world",
          code: 123,
          array: ["a", "b"],
          obj: {
            name: "zorro",
          },
        },
      })
    })
  })
})
