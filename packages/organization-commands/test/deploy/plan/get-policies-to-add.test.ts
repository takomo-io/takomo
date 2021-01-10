import { getPoliciesToAdd } from "../../../src/common/plan/organizational-units/create-org-entity-policies-plan"

const cases: string[][][] = [
  [[], [], []],
  [["example"], [], []],
  [["example"], ["example"], []],
  [[], ["example"], ["example"]],
  [[], ["foo", "bar"], ["foo", "bar"]],
  [["foo", "bar"], ["baz"], ["baz"]],
]

describe("#getPoliciesToAdd", () => {
  test.each(cases)("case %#", (current, local, expected) => {
    const actual = getPoliciesToAdd(current, local)
    expect(actual).toStrictEqual(expected)
  })
})
