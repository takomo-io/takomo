import { collectAllDependants } from "../../../src/dependencies"
import { createStack } from "../../helpers"

describe("collect all dependants", () => {
  test("when stack has no dependants", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const dependants = collectAllDependants(a.path, [a])
    expect(dependants).toHaveLength(0)
  })

  test("when stack has one direct dependant", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({
      name: "b",
      path: "/b.yml",
      dependants: [a.path],
    })

    const dependants = collectAllDependants(b.path, [a, b])

    expect(dependants).toHaveLength(1)
    expect(dependants[0]).toBe(a.path)
  })

  test("when stack has three direct dependants", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({ name: "b", path: "/b.yml" })
    const c = createStack({ name: "c", path: "/c.yml" })
    const d = createStack({
      name: "d",
      path: "/d.yml",
      dependants: [a.path, b.path, c.path],
    })

    const dependants = collectAllDependants(d.path, [a, b, c, d])

    expect(dependants).toHaveLength(3)
    expect(dependants).toContain(a.path)
    expect(dependants).toContain(b.path)
    expect(dependants).toContain(c.path)
  })

  test("when stack has nested dependants", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({ name: "b", path: "/b.yml" })
    const c = createStack({
      name: "c",
      path: "/c.yml",
      dependants: [a.path, b.path],
    })
    const d = createStack({
      name: "d",
      path: "/d.yml",
      dependants: [c.path],
    })
    const e = createStack({
      name: "e",
      path: "/e.yml",
      dependants: [d.path],
    })
    const f = createStack({ name: "f", path: "/f.yml" })

    const stacks = [a, b, c, d, e, f]

    const eDependants = collectAllDependants(e.path, stacks)

    expect(eDependants).toHaveLength(4)
    expect(eDependants).toContain(d.path)
    expect(eDependants).toContain(c.path)
    expect(eDependants).toContain(a.path)
    expect(eDependants).toContain(b.path)

    const cDependants = collectAllDependants(c.path, stacks)

    expect(cDependants).toHaveLength(2)
    expect(cDependants).toContain(a.path)
    expect(cDependants).toContain(b.path)
  })
})
