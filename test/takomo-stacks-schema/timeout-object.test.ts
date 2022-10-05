import { createStacksSchemas } from "../../src/takomo-stacks-schema"
import { expectNoValidationError, expectValidationErrors } from "../assertions"

const { timeoutObject } = createStacksSchemas({
  regions: [],
})

const valid = [{ update: 10 }, { create: 5 }, { create: 5, update: 3 }]

const invalid: Array<[unknown, string]> = [
  [-1, '"value" must be of type object'],
  ["a", '"value" must be of type object'],
]

describe("timeout object validation", () => {
  test.each(invalid)("fails when '%s' is given", (value, expectedMessage) => {
    expectValidationErrors(timeoutObject)(value, expectedMessage)
  })

  test.each(valid)("succeeds when '%s' is given", (value) => {
    expectNoValidationError(timeoutObject)(value)
  })
})
