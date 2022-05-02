import { parseTags } from "../src/parse-tags"

describe("#parseTags", () => {
  test("when undefined is given", () => {
    expect(parseTags(undefined)).toStrictEqual(new Map())
  })
  test("when null is given", () => {
    expect(parseTags(null)).toStrictEqual(new Map())
  })
  test("when empty object is given", () => {
    expect(parseTags({})).toStrictEqual(new Map())
  })
  test("when object with single string tag value is given", () => {
    const value = { one: "two" }
    const expected = new Map([["one", "two"]])
    expect(parseTags(value)).toStrictEqual(expected)
  })
  test("when object with multiple string tag values is given", () => {
    const value = { one: "two", cool: "yes-sir" }
    const expected = new Map([
      ["one", "two"],
      ["cool", "yes-sir"],
    ])
    expect(parseTags(value)).toStrictEqual(expected)
  })
  test("when object with single number tag value is given", () => {
    const value = { num: 1023 }
    const expected = new Map([["num", 1023]])
    expect(parseTags(value)).toStrictEqual(expected)
  })
  test("when object with single boolean tag value is given", () => {
    const value = { x: false }
    const expected = new Map([["x", false]])
    expect(parseTags(value)).toStrictEqual(expected)
  })
})
