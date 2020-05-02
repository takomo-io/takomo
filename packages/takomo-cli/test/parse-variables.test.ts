import { parseVariables } from "../src/common"

describe("parse var args", () => {
  test("populates only env when null var args are given", async () => {
    const { var: vars } = await parseVariables("test", null, null, null)
    expect(vars).toStrictEqual({})
  })

  test("populates only env when empty array var args are given", async () => {
    const { var: vars } = await parseVariables("test", [], [], null)
    expect(vars).toStrictEqual({})
  })

  test("vars override variables defined in files", async () => {
    const { var: vars } = await parseVariables(
      "test",
      ["example2.yml"],
      ["color=black", "address=jungle"],
      null,
    )
    expect(vars).toStrictEqual({
      color: "black",
      person: {
        name: "zorro",
      },
      address: "jungle",
    })
  })
})
