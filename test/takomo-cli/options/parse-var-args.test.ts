import { parseVarArgs } from "../../../src/cli/options/parse-var-args"

describe("#parseVarArgs", () => {
  test("returns an empty object when null is given", () => {
    const vars = parseVarArgs(null)
    expect(vars).toStrictEqual({})
  })

  test("returns an empty object when undefined is given", () => {
    const vars = parseVarArgs(undefined)
    expect(vars).toStrictEqual({})
  })

  test("returns an empty object when empty array is given", () => {
    const vars = parseVarArgs([])
    expect(vars).toStrictEqual({})
  })

  test("simple variable assignment", () => {
    const vars = parseVarArgs(["name=john"])
    expect(vars).toStrictEqual({ name: "john" })
  })

  test("multiple simple variable assignments", () => {
    const vars = parseVarArgs(["age=32", "code=secret"])
    expect(vars).toStrictEqual({ age: "32", code: "secret" })
  })

  test("latest variable overrides variables defined before", () => {
    const vars = parseVarArgs(["age=32", "code=secret", "code=public"])
    expect(vars).toStrictEqual({ age: "32", code: "public" })
  })
})
