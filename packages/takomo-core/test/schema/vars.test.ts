import { vars } from "../../src/schema"

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
    const { error } = vars.validate([])
    expect(error.message).toBe('"value" must be of type object')
  })

  test("when a string is given", () => {
    const { error } = vars.validate("stringy")
    expect(error.message).toBe('"value" must be of type object')
  })

  test("when a number is given", () => {
    const { error } = vars.validate(100)
    expect(error.message).toBe('"value" must be of type object')
  })

  test("when a boolean is given", () => {
    const { error } = vars.validate(true)
    expect(error.message).toBe('"value" must be of type object')
  })
})
