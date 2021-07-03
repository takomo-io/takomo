import { findNonUniques } from "../../src"

const cases: unknown[][][] = [
  [[], []],
  [[1], []],
  [["a", "b"], []],
  [["a", "b", "b"], ["b"]],
  [
    [4, 1, 2, 2, 3, 4],
    [2, 4],
  ],
]

describe("#findNonUniques", () => {
  test.each(cases)("case %#", (given, expected) => {
    expect(findNonUniques(given)).toStrictEqual(expected)
  })
})
