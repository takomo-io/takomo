import { createRootStackGroup } from "../../../../src/config/create-root-stack-group"
import { createStackGroupFromParent } from "../../../../src/config/create-stack-group-from-parent"

describe("create stack group config from parent", () => {
  test("using root as parent", () => {
    const root = createRootStackGroup()
    const group = createStackGroupFromParent(
      {
        dir: { fullPath: "/tmp/projects/stacks/dev", basename: "dev" },
        path: "/dev",
        parentPath: "/",
        children: [],
        stacks: [],
      },
      root,
    )

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
    const parent = createStackGroupFromParent(
      {
        dir: { fullPath: "/tmp/projects/stacks/prod", basename: "prod" },
        path: "/prod",
        parentPath: "/",
        children: [],
        stacks: [],
      },
      root,
    )
    const group = createStackGroupFromParent(
      {
        dir: {
          fullPath: "/tmp/projects/stacks/prod/eu-central-1",
          basename: "eu-central-1",
        },
        path: "/prod/eu-central-1",
        parentPath: "/prod",
        children: [],
        stacks: [],
      },
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
