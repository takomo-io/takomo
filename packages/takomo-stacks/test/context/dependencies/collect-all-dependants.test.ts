import { collectAllDependants } from "../../../src/context/dependencies"
import { createStack } from "../../helpers"

describe("collect all dependants", () => {
  test("when stack has no dependants", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const dependants = collectAllDependants(a.getPath(), [a])
    expect(dependants).toHaveLength(0)
  })

  test("when stack has one direct dependant", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({
      name: "b",
      path: "/b.yml",
      dependants: [a.getPath()],
    })

    const dependants = collectAllDependants(b.getPath(), [a, b])

    expect(dependants).toHaveLength(1)
    expect(dependants[0]).toBe(a.getPath())
  })

  test("when stack has three direct dependants", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({ name: "b", path: "/b.yml" })
    const c = createStack({ name: "c", path: "/c.yml" })
    const d = createStack({
      name: "d",
      path: "/d.yml",
      dependants: [a.getPath(), b.getPath(), c.getPath()],
    })

    const dependants = collectAllDependants(d.getPath(), [a, b, c, d])

    expect(dependants).toHaveLength(3)
    expect(dependants).toContain(a.getPath())
    expect(dependants).toContain(b.getPath())
    expect(dependants).toContain(c.getPath())
  })

  test("when stack has nested dependants", () => {
    const a = createStack({ name: "a", path: "/a.yml" })
    const b = createStack({ name: "b", path: "/b.yml" })
    const c = createStack({
      name: "c",
      path: "/c.yml",
      dependants: [a.getPath(), b.getPath()],
    })
    const d = createStack({
      name: "d",
      path: "/d.yml",
      dependants: [c.getPath()],
    })
    const e = createStack({
      name: "e",
      path: "/e.yml",
      dependants: [d.getPath()],
    })
    const f = createStack({ name: "f", path: "/f.yml" })

    const stacks = [a, b, c, d, e, f]

    const eDependants = collectAllDependants(e.getPath(), stacks)

    expect(eDependants).toHaveLength(4)
    expect(eDependants).toContain(d.getPath())
    expect(eDependants).toContain(c.getPath())
    expect(eDependants).toContain(a.getPath())
    expect(eDependants).toContain(b.getPath())

    const cDependants = collectAllDependants(c.getPath(), stacks)

    expect(cDependants).toHaveLength(2)
    expect(cDependants).toContain(a.getPath())
    expect(cDependants).toContain(b.getPath())
  })
})
