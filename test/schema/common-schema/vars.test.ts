import { createCommonSchema } from "../../../src/schema/common-schema.js"
import { expectValidationErrors } from "../../assertions.js"
const { vars } = createCommonSchema()

describe("vars validation succeeds", () => {
  test("when an empty object is given", () => {
    const { error } = vars.validate({})
    expect(error).toBeUndefined()
  })

  test("when a single variable is given", () => {
    const { error } = vars.validate({
      hello: "World",
    })
    expect(error).toBeUndefined()
  })

  test("when a complex variables are given", () => {
    const { error } = vars.validate({
      parent: {
        child: {
          name: "John",
          age: 10,
        },
        list: [1, 2, 3, 4],
      },
    })
    expect(error).toBeUndefined()
  })
})

describe("vars validation fails", () => {
  test("when an array is given", () => {
    expectValidationErrors(vars)([], '"value" must be of type object')
  })

  test("when a string is given", () => {
    expectValidationErrors(vars)("stringy", '"value" must be of type object')
  })

  test("when a number is given", () => {
    expectValidationErrors(vars)(100, '"value" must be of type object')
  })

  test("when a boolean is given", () => {
    expectValidationErrors(vars)(true, '"value" must be of type object')
  })
})
