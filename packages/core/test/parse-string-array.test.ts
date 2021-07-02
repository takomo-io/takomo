import { parseStringArray } from "../src/parser"

const cases: Array<[unknown, string[]]> = [
  [undefined, []],
  [null, []],
  [[], []],
  ["hello", ["hello"]],
  [["world"], ["world"]],
  [
    ["hello", "world"],
    ["hello", "world"],
  ],
]

describe("#parseStringArray", () => {
  test.each(cases)(
    "returns correct value when %s is given",
    (given, expected) => {
      const actual = parseStringArray(given)
      expect(actual).toStrictEqual(expected)
    },
  )
})
