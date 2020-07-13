import { getPoliciesToRemove } from "../../../src/deploy/plan/create-org-entity-policies-plan"

const cases: string[][][] = [
  [[], [], []],
  [["example"], [], ["example"]],
  [[], ["example"], []],
  [["foo"], ["foo"], []],
  [["foo", "bar"], ["foo"], ["bar"]],
  [["fuz", "baz"], [], ["fuz", "baz"]],
]

describe("#getPoliciesToRemove", () => {
  test.each(cases)("case %#", (current, local, expected) => {
    const actual = getPoliciesToRemove(current, local)
    expect(actual).toStrictEqual(expected)
  })
})
