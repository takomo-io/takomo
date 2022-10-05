import { sortStacksForUndeploy } from "../../../src/takomo-stacks-context"
import { createStack } from "../helpers"

describe("#sortStacksForUndeploy", () => {
  test("when no stacks are given", () => {
    expect(sortStacksForUndeploy([])).toHaveLength(0)
  })

  test("when one stack is given", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    expect(sortStacksForUndeploy([a])).toHaveLength(1)
  })

  test("when two stacks with no dependents are given", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({ name: "b", path: "/b.yml" })

    const sorted = sortStacksForUndeploy([a, b])

    expect(sorted[0].path).toBe(a.path)
    expect(sorted[1].path).toBe(b.path)
  })

  test("when two stacks are given", () => {
    const a = createStack({
      name: "a",
      path: "/a.yml",
      dependents: ["/b.yml"],
    })
    const b = createStack({ name: "b", path: "/b.yml" })

    const sorted = sortStacksForUndeploy([a, b])

    expect(sorted[0].path).toBe(b.path)
    expect(sorted[1].path).toBe(a.path)
  })

  test("when multiple stacks are given", () => {
    const a = createStack({
      name: "a",
      path: "/a.yml",
      dependents: ["/c.yml"],
    })
    const b = createStack({
      name: "b",
      path: "/b.yml",
      dependents: [],
    })
    const c = createStack({
      name: "c",
      path: "/c.yml",
      dependents: ["/b.yml"],
    })

    const sorted = sortStacksForUndeploy([a, b, c])

    expect(sorted[0].path).toBe(b.path)
    expect(sorted[1].path).toBe(c.path)
    expect(sorted[2].path).toBe(a.path)
  })

  test("when complex dependency graph is given", () => {
    const a = createStack({
      name: "a",
      path: "/a.yml",
      dependents: ["/c.yml", "/h.yml"],
    })
    const b = createStack({
      name: "b",
      path: "/b.yml",
      dependents: [],
    })
    const c = createStack({
      name: "c",
      path: "/c.yml",
      dependents: ["/d.yml", "/e.yml"],
    })
    const d = createStack({
      name: "d",
      path: "/d.yml",
      dependents: ["/f.yml"],
    })
    const e = createStack({
      name: "e",
      path: "/e.yml",
      dependents: ["/f.yml"],
    })
    const f = createStack({
      name: "f",
      path: "/f.yml",
      dependents: ["/g.yml"],
    })
    const g = createStack({
      name: "g",
      path: "/g.yml",
      dependents: [],
    })
    const h = createStack({
      name: "h",
      path: "/h.yml",
      dependents: [],
    })

    const sorted = sortStacksForUndeploy([a, b, c, d, e, f, g, h])

    expect(sorted[0].path).toBe(b.path)
    expect(sorted[1].path).toBe(g.path)
    expect(sorted[2].path).toBe(h.path)
    expect(sorted[3].path).toBe(f.path)
    expect(sorted[4].path).toBe(d.path)
    expect(sorted[5].path).toBe(e.path)
    expect(sorted[6].path).toBe(c.path)
    expect(sorted[7].path).toBe(a.path)
  })
})
