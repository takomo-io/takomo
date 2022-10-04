import { join } from "path"
import { loadVariablesFromFile } from "../../../src/takomo-util"

const projectDir = join(process.cwd(), "test", "variables", "files")

describe("#loadVariablesFromFile", () => {
  test("simple text file", async () => {
    const vars = await loadVariablesFromFile(projectDir, "vars-01.txt")
    expect(vars).toStrictEqual("hello")
  })

  test("json file", async () => {
    const vars = await loadVariablesFromFile(projectDir, "vars-01.json")
    expect(vars).toStrictEqual({ age: 12, codes: [1, 2, 3] })
  })

  test("yml file", async () => {
    const vars = await loadVariablesFromFile(projectDir, "vars-01.yml")
    expect(vars).toStrictEqual({ name: "John" })
  })
})
