import { sortStacksForDeletion } from "../../../../src/delete/build"
import { createStack } from "../../../helpers"

describe("sort stacks for deletion", () => {
  test("when no stacks are given", () => {
    expect(sortStacksForDeletion([])).toHaveLength(0)
  })

  test("when one stack is given", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    expect(sortStacksForDeletion([a])).toHaveLength(1)
  })

  test("when two stacks with no dependants are given", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({ name: "b", path: "/b.yml" })

    const sorted = sortStacksForDeletion([a, b])

    expect(sorted[0].getPath()).toBe(a.getPath())
    expect(sorted[1].getPath()).toBe(b.getPath())
  })

  test("when two stacks are given", () => {
    const a = createStack({
      name: "a",
      path: "/a.yml",
      dependants: ["/b.yml"],
    })
    const b = createStack({ name: "b", path: "/b.yml" })

    const sorted = sortStacksForDeletion([a, b])

    expect(sorted[0].getPath()).toBe(b.getPath())
    expect(sorted[1].getPath()).toBe(a.getPath())
  })

  test("when multiple stacks are given", () => {
    const a = createStack({
      name: "a",
      path: "/a.yml",
      dependants: ["/c.yml"],
    })
    const b = createStack({
      name: "b",
      path: "/b.yml",
      dependants: [],
    })
    const c = createStack({
      name: "c",
      path: "/c.yml",
      dependants: ["/b.yml"],
    })

    const sorted = sortStacksForDeletion([a, b, c])

    expect(sorted[0].getPath()).toBe(b.getPath())
    expect(sorted[1].getPath()).toBe(c.getPath())
    expect(sorted[2].getPath()).toBe(a.getPath())
  })

  test("when complex dependency graph is given", () => {
    const a = createStack({
      name: "a",
      path: "/a.yml",
      dependants: ["/c.yml", "/h.yml"],
    })
    const b = createStack({
      name: "b",
      path: "/b.yml",
      dependants: [],
    })
    const c = createStack({
      name: "c",
      path: "/c.yml",
      dependants: ["/d.yml", "/e.yml"],
    })
    const d = createStack({
      name: "d",
      path: "/d.yml",
      dependants: ["/f.yml"],
    })
    const e = createStack({
      name: "e",
      path: "/e.yml",
      dependants: ["/f.yml"],
    })
    const f = createStack({
      name: "f",
      path: "/f.yml",
      dependants: ["/g.yml"],
    })
    const g = createStack({
      name: "g",
      path: "/g.yml",
      dependants: [],
    })
    const h = createStack({
      name: "h",
      path: "/h.yml",
      dependants: [],
    })

    const sorted = sortStacksForDeletion([a, b, c, d, e, f, g, h])

    expect(sorted[0].getPath()).toBe(b.getPath())
    expect(sorted[1].getPath()).toBe(g.getPath())
    expect(sorted[2].getPath()).toBe(h.getPath())
    expect(sorted[3].getPath()).toBe(f.getPath())
    expect(sorted[4].getPath()).toBe(d.getPath())
    expect(sorted[5].getPath()).toBe(e.getPath())
    expect(sorted[6].getPath()).toBe(c.getPath())
    expect(sorted[7].getPath()).toBe(a.getPath())
  })
})
