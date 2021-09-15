import { parseVarFileArgs } from "../src/common"

describe("parse var file args", () => {
  test("returns an empty object when empty array is given", async () => {
    const vars = await parseVarFileArgs(".", [])
    expect(vars).toStrictEqual({})
  })

  test("load variables from a .yml file to a variable", async () => {
    const vars = await parseVarFileArgs("test", ["sample=example.yml"])
    const expected = {
      sample: {
        color: "red",
        person: { weight: 80, height: 177 },
      },
    }
    expect(vars).toStrictEqual(expected)
  })

  test("load variables from a .yml file", async () => {
    const vars = await parseVarFileArgs("test", ["example.yml"])
    const expected = {
      color: "red",
      person: { weight: 80, height: 177 },
    }
    expect(vars).toStrictEqual(expected)
  })

  test("load variables from a .json file to a variable", async () => {
    const vars = await parseVarFileArgs("test", ["hello=example.json"])
    const expected = {
      hello: {
        key: "value",
        array: ["a", "b", "c"],
      },
    }
    expect(vars).toStrictEqual(expected)
  })

  test("load variables from a .json file", async () => {
    const vars = await parseVarFileArgs("test", ["example.json"])
    const expected = {
      key: "value",
      array: ["a", "b", "c"],
    }
    expect(vars).toStrictEqual(expected)
  })

  test("load variables from multiple files", async () => {
    const vars = await parseVarFileArgs("test", ["example.yml", "example2.yml"])
    const expected = {
      color: "blue",
      person: { weight: 80, height: 177, name: "zorro" },
      address: "street 1",
    }
    expect(vars).toStrictEqual(expected)
  })

  test("load variables from other than .json or .yml file to a variable", async () => {
    const vars = await parseVarFileArgs("test", ["myValue=example.txt"])
    const expected = {
      myValue: "my simple value",
    }
    expect(vars).toStrictEqual(expected)
  })

  test("variables from any file must be assigned to a variable if returned value is not an object", async () => {
    try {
      await parseVarFileArgs("test", ["example.txt"])
    } catch (e: any) {
      expect(e.message).toBe(
        "Contents of variable file example.txt could not be deserialized to an object",
      )
    }
  })

  test("load variables from a .json file with path starting with ./ ", async () => {
    const vars = await parseVarFileArgs("test", ["./example.json"])
    const expected = {
      key: "value",
      array: ["a", "b", "c"],
    }
    expect(vars).toStrictEqual(expected)
  })
})
