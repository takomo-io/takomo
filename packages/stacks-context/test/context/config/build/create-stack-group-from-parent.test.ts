import { createRootStackGroup } from "../../../../src/config/create-root-stack-group"
import { createStackGroupFromParent } from "../../../../src/config/create-stack-group-from-parent"

describe("create stack group config from parent", () => {
  test("using root as parent", () => {
    const root = createRootStackGroup()
    const group = createStackGroupFromParent(
      {
        getConfig: jest.fn(),
        name: "dev",
        path: "/dev",
        parentPath: "/",
        children: [],
        stacks: [],
      },
      root,
    )

    expect(group.path).toEqual("/dev")
    expect(group.root).toEqual(false)
    expect(group.project).toBeUndefined()
    expect(group.templateBucket).toBeUndefined()
    expect(group.regions).toEqual([])
    expect(group.commandRole).toBeUndefined()
    expect(group.timeout).toBeUndefined()
    expect(group.capabilities).toBeUndefined()
    expect(group.ignore).toBeFalsy()
    expect(group.children).toHaveLength(0)
  })

  test("using a non-root parent", () => {
    const root = createRootStackGroup()
    const parent = createStackGroupFromParent(
      {
        getConfig: jest.fn(),
        name: "prod",
        path: "/prod",
        parentPath: "/",
        children: [],
        stacks: [],
      },
      root,
    )
    const group = createStackGroupFromParent(
      {
        getConfig: jest.fn(),
        name: "eu-central-1",
        path: "/prod/eu-central-1",
        parentPath: "/prod",
        children: [],
        stacks: [],
      },
      parent,
    )

    expect(group.path).toEqual("/prod/eu-central-1")
    expect(group.root).toEqual(false)
    expect(group.project).toBeUndefined()
    expect(group.templateBucket).toBeUndefined()
    expect(group.regions).toEqual([])
    expect(group.commandRole).toBeUndefined()
    expect(group.timeout).toBeUndefined()
    expect(group.capabilities).toBeUndefined()
    expect(group.ignore).toBeFalsy()
    expect(group.children).toHaveLength(0)
  })
})
