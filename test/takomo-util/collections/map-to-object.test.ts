import { mapToObject } from "../../../src/takomo-util"

describe("#mapToObject", () => {
  describe("returns correct value when", () => {
    test.concurrent("an empty Map is given", async () => {
      expect(mapToObject(new Map())).toStrictEqual({})
    })
    test.concurrent("a Map with single value is given", async () => {
      expect(mapToObject(new Map([["name", "John"]]))).toStrictEqual({
        name: "John",
      })
    })
    test.concurrent("a Map with multiple values is given", async () => {
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
