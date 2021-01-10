import { createRootStackGroup } from "../../../../src/config/create-root-stack-group"

describe("create root stack group config", () => {
  test("for root", () => {
    const root = createRootStackGroup()

    expect(root.path).toEqual("/")
    expect(root.root).toEqual(true)
    expect(root.project).toBeUndefined()
    expect(root.templateBucket).toBeUndefined()
    expect(root.regions).toStrictEqual([])
    expect(root.commandRole).toBeUndefined()
    expect(root.timeout).toBeUndefined()
    expect(root.capabilities).toBeUndefined()
    expect(root.ignore).toBeFalsy()
    expect(root.children).toHaveLength(0)
  })
})
