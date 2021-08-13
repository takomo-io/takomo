import { formatYaml } from "../../src"

describe("#formatYaml", () => {
  test("Simple", () => {
    expect(
      formatYaml({
        age: 69,
        name: "Rick Sanchez",
        code: undefined,
      }),
    ).toStrictEqual("age: 69\nname: Rick Sanchez\n")
  })

  test("Complex", () => {
    expect(
      formatYaml({
        age: 69,
        name: "Rick Sanchez",
        code: undefined,
        children: [
          { name: "Don", code: undefined },
          { name: "Pablo", code: 123 },
        ],
      }),
    ).toStrictEqual(
      "age: 69\nchildren:\n  - name: Don\n  - code: 123\n    name: Pablo\nname: Rick Sanchez\n",
    )
  })
})
