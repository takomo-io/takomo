import { mapToObject } from "../../src"

describe("#mapToObject", () => {
  describe("returns correct value when", () => {
    test("an empty Map is given", () => {
      expect(mapToObject(new Map())).toStrictEqual({})
    })
    test("a Map with single value is given", () => {
      expect(mapToObject(new Map([["name", "John"]]))).toStrictEqual({
        name: "John",
      })
    })
    test("a Map with multiple values is given", () => {
      expect(
        mapToObject(
          new Map<string, any>([
            ["age", 12],
            ["code", "fi"],
          ]),
        ),
      ).toStrictEqual({
        code: "fi",
        age: 12,
      })
    })
  })
})
