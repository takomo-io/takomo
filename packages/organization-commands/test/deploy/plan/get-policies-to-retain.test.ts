import { getPoliciesToRetain } from "../../../src/common/plan/organizational-units/create-org-entity-policies-plan"

const cases: string[][][] = [
  [[], [], []],
  [["example"], [], []],
  [["example"], ["example"], ["example"]],
  [[], ["example"], []],
  [["foo", "bar"], ["foo"], ["foo"]],
  [
    ["foo", "bar"],
    ["foo", "bar"],
    ["foo", "bar"],
  ],
]

describe("#getPoliciesToRetain", () => {
  test.each(cases)("case %#", (current, local, expected) => {
    const actual = getPoliciesToRetain(current, local)
    expect(actual).toStrictEqual(expected)
  })
})
