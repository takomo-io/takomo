import { collectAllDependents } from "../../../src/dependencies"
import { createStack } from "../../helpers"

describe("collect all dependents", () => {
  test("when stack has no dependents", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const dependents = collectAllDependents(a.path, [a])
    expect(dependents).toHaveLength(0)
  })

  test("when stack has one direct dependant", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({
      name: "b",
      path: "/b.yml",
      dependents: [a.path],
    })

    const dependents = collectAllDependents(b.path, [a, b])

    expect(dependents).toHaveLength(1)
    expect(dependents[0]).toBe(a.path)
  })

  test("when stack has three direct dependents", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({ name: "b", path: "/b.yml" })
    const c = createStack({ name: "c", path: "/c.yml" })
    const d = createStack({
      name: "d",
      path: "/d.yml",
      dependents: [a.path, b.path, c.path],
    })

    const dependents = collectAllDependents(d.path, [a, b, c, d])

    expect(dependents).toHaveLength(3)
    expect(dependents).toContain(a.path)
    expect(dependents).toContain(b.path)
    expect(dependents).toContain(c.path)
  })

  test("when stack has nested dependents", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({ name: "b", path: "/b.yml" })
    const c = createStack({
      name: "c",
      path: "/c.yml",
      dependents: [a.path, b.path],
    })
    const d = createStack({
      name: "d",
      path: "/d.yml",
      dependents: [c.path],
    })
    const e = createStack({
      name: "e",
      path: "/e.yml",
      dependents: [d.path],
    })
    const f = createStack({ name: "f", path: "/f.yml" })

    const stacks = [a, b, c, d, e, f]

    const eDependents = collectAllDependents(e.path, stacks)

    expect(eDependents).toHaveLength(4)
    expect(eDependents).toContain(d.path)
    expect(eDependents).toContain(c.path)
    expect(eDependents).toContain(a.path)
    expect(eDependents).toContain(b.path)

    const cDependents = collectAllDependents(c.path, stacks)

    expect(cDependents).toHaveLength(2)
    expect(cDependents).toContain(a.path)
    expect(cDependents).toContain(b.path)
  })
})
