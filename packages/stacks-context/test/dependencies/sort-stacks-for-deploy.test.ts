import { sortStacksForDeploy } from "../../src/dependencies"
import { createStack } from "../helpers"

describe("#sortStacksForDeploy", () => {
  test("when no stacks are given", () => {
    expect(sortStacksForDeploy([])).toHaveLength(0)
  })

  test("when one stack is given", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    expect(sortStacksForDeploy([a])).toHaveLength(1)
  })

  test("when two stacks with no dependencies are given", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({ name: "b", path: "/b.yml" })

    const sorted = sortStacksForDeploy([a, b])

    expect(sorted[0].getPath()).toBe(a.getPath())
    expect(sorted[1].getPath()).toBe(b.getPath())
  })

  test("when two stacks are given", () => {
    const a = createStack({
      name: "a",
      path: "/a.yml",
      dependencies: ["/b.yml"],
    })
    const b = createStack({ name: "b", path: "/b.yml" })

    const sorted = sortStacksForDeploy([a, b])

    expect(sorted[0].getPath()).toBe(b.getPath())
    expect(sorted[1].getPath()).toBe(a.getPath())
  })

  test("when multiple stacks are given", () => {
    const a = createStack({
      name: "a",
      path: "/a.yml",
      dependencies: ["/c.yml"],
    })
    const b = createStack({
      name: "b",
      path: "/b.yml",
      dependencies: [],
    })
    const c = createStack({
      name: "c",
      path: "/c.yml",
      dependencies: ["/b.yml"],
    })

    const sorted = sortStacksForDeploy([a, b, c])

    expect(sorted[0].getPath()).toBe(b.getPath())
    expect(sorted[1].getPath()).toBe(c.getPath())
    expect(sorted[2].getPath()).toBe(a.getPath())
  })

  test("when complex dependency graph is given", () => {
    const a = createStack({
      name: "a",
      path: "/a.yml",
      dependencies: ["/c.yml", "/h.yml"],
    })
    const b = createStack({
      name: "b",
      path: "/b.yml",
      dependencies: [],
    })
    const c = createStack({
      name: "c",
      path: "/c.yml",
      dependencies: ["/d.yml", "/e.yml"],
    })
    const d = createStack({
      name: "d",
      path: "/d.yml",
      dependencies: ["/f.yml"],
    })
    const e = createStack({
      name: "e",
      path: "/e.yml",
      dependencies: ["/f.yml"],
    })
    const f = createStack({
      name: "f",
      path: "/f.yml",
      dependencies: ["/g.yml"],
    })
    const g = createStack({
      name: "g",
      path: "/g.yml",
      dependencies: [],
    })
    const h = createStack({
      name: "h",
      path: "/h.yml",
      dependencies: [],
    })

    const sorted = sortStacksForDeploy([a, b, c, d, e, f, g, h])

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
