import { parseVarFileOptions } from "../../../src/takomo-cli/options/parse-var-file-options"

const cases: Array<any[]> = [
  [undefined, []],
  [null, []],
  [[], []],
  ["single-file.json", [{ filePath: "single-file.json" }]],
  [["single-file1.json"], [{ filePath: "single-file1.json" }]],
  [
    ["file.json", "another.yml"],
    [{ filePath: "file.json" }, { filePath: "another.yml" }],
  ],
  ["myVar=some.yml", [{ variableName: "myVar", filePath: "some.yml" }]],
  [
    "myVar=/full/path/some.yml",
    [{ variableName: "myVar", filePath: "/full/path/some.yml" }],
  ],
]

describe("#parseVarFileOptions", () => {
  test.each(cases)("case %#", (given, expected) => {
    const actual = parseVarFileOptions(given)
    expect(actual).toStrictEqual(expected)
  })
})
