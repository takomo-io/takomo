import { fillMissingDeploymentGroups } from "../../src/takomo-deployment-targets-config/util"

const cases: [any, any][] = [
  [{ root: {} }, { root: {} }],
  [{ "foo/bar": {} }, { foo: {}, "foo/bar": {} }],
  [{ "foo/bar/baz": {} }, { foo: {}, "foo/bar": {}, "foo/bar/baz": {} }],
  [
    { "foo/bar/baz": {}, foo: {} },
    { foo: {}, "foo/bar": {}, "foo/bar/baz": {} },
  ],
  [
    { one: {}, two: {} },
    { one: {}, two: {} },
  ],
  [
    { one: {}, two: {}, "three/six": {} },
    { one: {}, two: {}, three: {}, "three/six": {} },
  ],
]

describe("#fillMissingDeploymentGroups", () => {
  test.each(cases)("case %#", (given, expected) => {
    expect(fillMissingDeploymentGroups(given)).toStrictEqual(expected)
  })
})
