import { join } from "path"
import { collectProjectConfigFileHierarchy } from "../../src/takomo-config-repository-fs/project/config"

const projectDir = join(process.cwd(), "test", "config-file-hierarchy")

describe("#collectProjectConfigFileHierarchy", () => {
  test("no hierarchy", async () => {
    const items = await collectProjectConfigFileHierarchy(projectDir, "a-1.yml")
    expect(items).toStrictEqual([
      { absolutePath: join(projectDir, "a-1.yml"), contents: {} },
    ])
  })

  test("hierarchy of two files", async () => {
    const items = await collectProjectConfigFileHierarchy(projectDir, "b-1.yml")
    expect(items).toStrictEqual([
      {
        absolutePath: join(projectDir, "b-1.yml"),
        contents: { extends: "b-2.yml" },
      },
      { absolutePath: join(projectDir, "b-2.yml"), contents: {} },
    ])
  })

  test("hierarchy of three files", async () => {
    const items = await collectProjectConfigFileHierarchy(projectDir, "c-1.yml")
    expect(items).toStrictEqual([
      {
        absolutePath: join(projectDir, "c-1.yml"),
        contents: { extends: "c-2.yml" },
      },
      {
        absolutePath: join(projectDir, "c-2.yml"),
        contents: { extends: "c-3.yml" },
      },
      {
        absolutePath: join(projectDir, "c-3.yml"),
        contents: {},
      },
    ])
  })

  test("circular hierarchy", async () => {
    await expect(async () =>
      collectProjectConfigFileHierarchy(projectDir, "d-1.yml"),
    ).rejects.toThrow(
      `Circular inheritance of project config files detected: ${projectDir}/d-1.yml -> ${projectDir}/d-2.yml -> ${projectDir}/d-1.yml`,
    )
  })
})
