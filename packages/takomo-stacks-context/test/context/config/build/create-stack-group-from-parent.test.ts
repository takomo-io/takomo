import {
  createRootStackGroup,
  createStackGroupFromParent,
} from "../../../../src/config/build"

describe("create stack group config from parent", () => {
  test("using root as parent", () => {
    const root = createRootStackGroup()
    const group = createStackGroupFromParent("/tmp/projects/config/dev", root)

    expect(group.getPath()).toEqual("/dev")
    expect(group.isRoot()).toEqual(false)
    expect(group.getProject()).toBeNull()
    expect(group.getTemplateBucket()).toBeNull()
    expect(group.getRegions()).toEqual([])
    expect(group.getCommandRole()).toBeNull()
    expect(group.getTimeout()).toBeNull()
    expect(group.getCapabilities()).toBeNull()
    expect(group.isIgnored()).toBeFalsy()
    expect(group.getChildren()).toHaveLength(0)
  })

  test("using a non-root parent", () => {
    const root = createRootStackGroup()
    const parent = createStackGroupFromParent("/tmp/projects/config/prod", root)
    const group = createStackGroupFromParent(
      "/tmp/projects/config/prod/eu-central-1",
      parent,
    )

    expect(group.getPath()).toEqual("/prod/eu-central-1")
    expect(group.isRoot()).toEqual(false)
    expect(group.getProject()).toBeNull()
    expect(group.getTemplateBucket()).toBeNull()
    expect(group.getRegions()).toEqual([])
    expect(group.getCommandRole()).toBeNull()
    expect(group.getTimeout()).toBeNull()
    expect(group.getCapabilities()).toBeNull()
    expect(group.isIgnored()).toBeFalsy()
    expect(group.getChildren()).toHaveLength(0)
  })
})
