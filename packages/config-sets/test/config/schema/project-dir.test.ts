import { projectDir } from "../../../src/config/schema"
import { expectNoValidationError, expectValidationErrors } from "../../helpers"

const valid = ["basic", "/tmp", "~/Docs"]

describe("project dir validation", () => {
  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(projectDir),
  )

  describe("fails when", () => {
    test("an empty string is given", () => {
      expectValidationErrors(projectDir)(
        "",
        '"value" is not allowed to be empty',
      )
    })

    test("a number is given", () => {
      expectValidationErrors(projectDir)(100, '"value" must be a string')
    })

    test("a boolean is given", () => {
      expectValidationErrors(projectDir)(100, '"value" must be a string')
    })
  })
})
