import { expandFilePath } from "../../../src/takomo-util"

const homeDir = "/home"

const cases = [
  ["~/my-dir", "~/my-dir"],
  ["hello", `${homeDir}/hello`],
  ["./cool", `${homeDir}/cool`],
  ["./cool/", `${homeDir}/cool/`],
  ["/full/path", "/full/path"],
  ["/full/path/", "/full/path/"],
  ["/full/path/hello.txt", "/full/path/hello.txt"],
  ["./", homeDir],
]

describe("#expandFilePath", () => {
  test.each(cases)("given %s returns %s", (input, expected) => {
    expect(expandFilePath(homeDir, input)).toStrictEqual(expected)
  })
})
