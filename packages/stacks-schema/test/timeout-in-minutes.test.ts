import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/test-unit"
import { createStacksSchemas } from "../src"

const { timeoutInMinutes } = createStacksSchemas({
  regions: [],
})

const valid = [10, 6, 0]

const invalid: Array<[unknown, string]> = [
  [-1, '"value" must be greater than or equal to 0'],
  ["a", '"value" must be a number'],
  [1.1, '"value" must be an integer'],
]

describe("timeout validation", () => {
  test.each(invalid)("fails when '%s' is given", (value, expectedMessage) => {
    expectValidationErrors(timeoutInMinutes)(value, expectedMessage)
  })

  test.each(valid)("succeeds when '%s' is given", (value) => {
    expectNoValidationError(timeoutInMinutes)(value)
  })
})
