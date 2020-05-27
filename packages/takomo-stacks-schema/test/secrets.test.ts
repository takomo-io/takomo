import { secrets } from "../src"

describe("secrets validation succeeds", () => {
  test("when a single secret is given", () => {
    const { error } = secrets.validate({
      username: {
        description: "database description",
      },
    })
    expect(error).toBeUndefined()
  })

  test("when multiple secrets are given", () => {
    const { error } = secrets.validate({
      password: {
        description: "database password",
      },
      secretKey: {
        description: "secret key",
      },
    })
    expect(error).toBeUndefined()
  })
})

describe("secrets validation fails", () => {
  test("when the secret contains unknown properties", () => {
    const { error } = secrets.validate({
      username: {
        description: "database description",
        foo: "bar",
      },
    })
    expect(error.message).toBe('"username.foo" is not allowed')
  })
})
