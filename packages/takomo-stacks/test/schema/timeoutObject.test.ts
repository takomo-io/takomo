import { timeoutObject } from "../../src/schema"

const valid = [{ update: 10 }, { create: 5 }, { create: 5, update: 3 }]

const invalid = [
  [-1, '"value" must be of type object'],
  ["a", '"value" must be of type object'],
]

describe("timeout object validation", () => {
  test.each(invalid)("fails when '%s' is given", (value, expectedMessage) => {
    const { error } = timeoutObject.validate(value)
    expect(error.message).toBe(expectedMessage)
  })

  test.each(valid)("succeeds when '%s' is given", value => {
    const { error } = timeoutObject.validate(value)
    expect(error).toBeUndefined()
  })
})
