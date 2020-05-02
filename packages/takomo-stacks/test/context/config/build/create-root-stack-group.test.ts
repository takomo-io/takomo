import { createRootStackGroup } from "../../../../src/context/config/build"

describe("create root stack group config", () => {
  test("for root", () => {
    const root = createRootStackGroup()

    expect(root.getPath()).toEqual("/")
    expect(root.isRoot()).toEqual(true)
    expect(root.getProject()).toBeNull()
    expect(root.getTemplateBucket()).toBeNull()
    expect(root.getRegions()).toStrictEqual([])
    expect(root.getCommandRole()).toBeNull()
    expect(root.getTimeout()).toBeNull()
    expect(root.getCapabilities()).toBeNull()
    expect(root.isIgnored()).toBeFalsy()
    expect(root.getChildren()).toHaveLength(0)
  })
})
