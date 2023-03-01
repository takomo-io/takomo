import { ExternalResolverConfig } from "../../src/config/project-config.js"
import { parseExternalResolvers } from "../../src/parser/project-config-parser.js"

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
