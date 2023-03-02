import { createConfigSetsSchemas } from "../../../src/schema/config-sets-schema.js"
import { expectNoValidationError } from "../../assertions.js"

const { configSet } = createConfigSetsSchemas({ regions: [] })

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
    test("a valid full config set is given", () => {
      expectNoValidationError(configSet)({
        description: "my config set",
        commandPaths: ["/path", "/another"],
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
