import { timeoutInMinutes } from "../src"

const valid = [10, "6", 0]

const invalid = [
  [-1, '"value" must be larger than or equal to 0'],
  ["a", '"value" must be a number'],
  [1.1, '"value" must be an integer'],
]

describe("timeout in minutes validation", () => {
  test.each(invalid)("fails when '%s' is given", (value, expectedMessage) => {
    const { error } = timeoutInMinutes.validate(value)
    expect(error!.message).toBe(expectedMessage)
  })

  test.each(valid)("succeeds when '%s' is given", (value) => {
    const { error } = timeoutInMinutes.validate(value)
    expect(error).toBeUndefined()
  })
})
