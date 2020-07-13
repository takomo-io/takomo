import { parseVarArgs } from "../src/common"

describe("parse var args", () => {
  test("returns an empty object when null is given", async () => {
    const vars = parseVarArgs(null, {})
    expect(vars).toStrictEqual({})
  })

  test("returns an empty object when empty array is given", async () => {
    const vars = parseVarArgs([], {})
    expect(vars).toStrictEqual({})
  })

  test("simple variable assignment", async () => {
    const vars = parseVarArgs(["name=john"], {})
    expect(vars).toStrictEqual({ name: "john" })
  })

  test("multiple simple variable assignments", async () => {
    const vars = parseVarArgs(["age=32", "code=secret"], {})
    expect(vars).toStrictEqual({ age: "32", code: "secret" })
  })

  test("latest variable overrides variables defined before", async () => {
    const vars = parseVarArgs(["age=32", "code=secret", "code=public"], {})
    expect(vars).toStrictEqual({ age: "32", code: "public" })
  })
})
