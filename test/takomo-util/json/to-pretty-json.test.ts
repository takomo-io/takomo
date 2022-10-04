import { toPrettyJson } from "../../../src/takomo-util"

describe("#toPrettyJson", () => {
  test("Simple object", () => {
    expect(
      toPrettyJson({
        name: "Rick Sanchez",
        age: 69,
        code: undefined,
      }),
    ).toStrictEqual('{\n  "age": 69,\n  "name": "Rick Sanchez"\n}')
  })
})
