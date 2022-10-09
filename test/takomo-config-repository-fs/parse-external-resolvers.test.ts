import { parseExternalResolvers } from "../../src/takomo-config-repository-fs/project/config"
import { ExternalResolverConfig } from "../../src/takomo-core"

const cases: Array<[unknown, ReadonlyArray<ExternalResolverConfig>]> = [
  [undefined, []],
  [null, []],
  [[], []],
  [["takomo-package-name"], [{ package: "takomo-package-name" }]],
  [
    ["takomo-package-name", "other"],
    [{ package: "takomo-package-name" }, { package: "other" }],
  ],
  [[{ package: "xxxxx" }], [{ package: "xxxxx", name: undefined }]],
  [
    ["yyyyyyyy", { package: "a", name: undefined }],
    [{ package: "yyyyyyyy" }, { package: "a", name: undefined }],
  ],
  [
    [{ package: "xxxxx", name: "override" }],
    [{ package: "xxxxx", name: "override" }],
  ],
]

describe("#parseExternalResolvers", () => {
  test.each(cases)("case %#", (given, expected) => {
    expect(parseExternalResolvers(given)).toStrictEqual(expected)
  })
})
