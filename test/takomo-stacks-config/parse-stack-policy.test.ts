import { parseStackPolicy } from "../../src/parser/stacks/parse-stack-policy.js"

describe("#parseTemplate", () => {
  test("when a string is given", () => {
    const actual = parseStackPolicy('{"Action": "Allow"}')
    expect(actual).toStrictEqual('{\n  "Action": "Allow"\n}')
  })
  test("when an object is given", () => {
    const actual = parseStackPolicy({ Action: "Allow" })
    expect(actual).toStrictEqual('{\n  "Action": "Allow"\n}')
  })
})
