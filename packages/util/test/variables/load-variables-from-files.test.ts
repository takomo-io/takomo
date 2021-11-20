import { join } from "path"
import { loadVariablesFromFiles } from "../../src"

const projectDir = join(process.cwd(), "test", "variables", "files")

describe("#loadVariablesFromFiles", () => {
  test("single json file", async () => {
    const vars = await loadVariablesFromFiles(projectDir, [
      { filePath: "vars-01.json" },
    ])
    expect(vars).toStrictEqual({ age: 12, codes: [1, 2, 3] })
  })

  test("single yml file", async () => {
    const vars = await loadVariablesFromFiles(projectDir, [
      { filePath: "vars-01.yml" },
    ])
    expect(vars).toStrictEqual({ name: "John" })
  })

  test("multiple files", async () => {
    const vars = await loadVariablesFromFiles(projectDir, [
      { filePath: "vars-01.yml" },
      { filePath: "vars-01.json" },
    ])
    expect(vars).toStrictEqual({ name: "John", age: 12, codes: [1, 2, 3] })
  })

  test("multiple files with overriding variables", async () => {
    const vars = await loadVariablesFromFiles(projectDir, [
      { filePath: "vars-01.yml" },
      { filePath: "vars-01.json" },
      { filePath: "vars-02.yml" },
    ])
    expect(vars).toStrictEqual({
      name: "Papa",
      age: 100,
      codes: [1, 2, 3],
      color: "red",
    })
  })

  test("named variable", async () => {
    const vars = await loadVariablesFromFiles(projectDir, [
      { filePath: "vars-01.yml", variableName: "one" },
    ])
    expect(vars).toStrictEqual({ one: { name: "John" } })
  })

  test("named variables", async () => {
    const vars = await loadVariablesFromFiles(projectDir, [
      { filePath: "vars-01.yml", variableName: "one" },
      { filePath: "vars-01.yml", variableName: "two" },
    ])
    expect(vars).toStrictEqual({ one: { name: "John" }, two: { name: "John" } })
  })

  test("named variables and overriding", async () => {
    const vars = await loadVariablesFromFiles(projectDir, [
      { filePath: "vars-01.yml", variableName: "cool" },
      { filePath: "vars-01.txt", variableName: "cool" },
    ])
    expect(vars).toStrictEqual({ cool: "hello" })
  })
})
