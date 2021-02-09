import { expandDir } from "../../src"

const cases = [
  ["~/my-dir", "~/my-dir"],
  ["hello", "/home/hello"],
  ["./cool", "./cool"],
  ["/full/path", "/full/path"],
]

describe("#expandDir", () => {
  test.each(cases)("given %s returns %s", (input, expected) => {
    expect(expandDir("/home", input)).toStrictEqual(expected)
  })
})
