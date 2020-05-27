import { hookStage } from "../src"
import { expectNoValidationError, expectValidationErrors } from "./helpers"

const valid = ["before", "after"]

const invalid = [
  [
    "",
    '"value" is not allowed to be empty',
    '"value" must be one of [before, after]',
  ],
  ["whenever", '"value" must be one of [before, after]'],
]

describe("hook name validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(hookStage),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(hookStage),
  )
})
