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

    const sorted = sortStacksForDeploy([a, b]).map((s) => s.path)
    expect(sorted).toStrictEqual([a.path, b.path])
  })

  test("when two stacks are given", () => {
    const a = createStack({
      name: "a",
      path: "/a.yml",
      dependencies: ["/b.yml"],
    })
    const b = createStack({ name: "b", path: "/b.yml" })

    const sorted = sortStacksForDeploy([a, b]).map((s) => s.path)
    expect(sorted).toStrictEqual([b.path, a.path])
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

    const sorted = sortStacksForDeploy([a, b, c]).map((s) => s.path)
    expect(sorted).toStrictEqual([b.path, c.path, a.path])
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

    const sorted = sortStacksForDeploy([a, b, c, d, e, f, g, h]).map(
      (s) => s.path,
    )

    expect(sorted).toStrictEqual([
      b.path,
      g.path,
      h.path,
      f.path,
      d.path,
      e.path,
      c.path,
      a.path,
    ])
  })

  test("when even more complex dependency graph is given", () => {
    const euNorthA = createStack({
      name: "eu-north-1-a",
      path: "/h/eu-north-1/a/a.yml/eu-north-1",
      dependencies: ["/h/eu-north-1/b/b.yml/eu-north-1"],
    })

    const euNorthB = createStack({
      name: "eu-north-1-b",
      path: "/h/eu-north-1/b/b.yml/eu-north-1",
      dependencies: [],
    })

    const euWestB = createStack({
      name: "eu-west-1-b",
      path: "/h/eu-west-1/b/b.yml/eu-west-1",
      dependencies: [],
    })

    const euWestC = createStack({
      name: "eu-west-1-c",
      path: "/h/eu-west-1/c/c.yml/eu-west-1",
      dependencies: [
        "/h/us-east-1/h/h.yml/us-east-1",
        "/h/eu-west-1/s/s.yml/eu-west-1",
      ],
    })

    const euWestD = createStack({
      name: "eu-west-1-d",
      path: "/h/eu-west-1/d/d.yml/eu-west-1",
      dependencies: ["/h/eu-west-1/e/e.yml/eu-west-1"],
    })

    const euWestE = createStack({
      name: "eu-west-1-e",
      path: "/h/eu-west-1/e/e.yml/eu-west-1",
      dependencies: ["/h/us-east-1/s/s.yml/us-east-1"],
    })

    const euWestG = createStack({
      name: "eu-west-1-g",
      path: "/h/eu-west-1/g/g.yml/eu-west-1",
      dependencies: [],
    })

    const euWestH = createStack({
      name: "eu-west-1-h",
      path: "/h/eu-west-1/h/h.yml/eu-west-1",
      dependencies: [
        "/h/eu-west-1/l/l.yml/eu-west-1",
        "/h/eu-west-1/c/c.yml/eu-west-1",
      ],
    })

    const euWestI = createStack({
      name: "eu-west-1-i",
      path: "/h/eu-west-1/i/i.yml/eu-west-1",
      dependencies: [
        "/h/eu-west-1/c/c.yml/eu-west-1",
        "/h/eu-west-1/e/e.yml/eu-west-1",
        "/h/us-east-1/i/i.yml/us-east-1",
        "/h/eu-west-1/r/r.yml/eu-west-1",
        "/h/eu-west-1/k/k.yml/eu-west-1",
      ],
    })

    const euWestJ = createStack({
      name: "eu-west-1-j",
      path: "/h/eu-west-1/j/j.yml/eu-west-1",
      dependencies: [
        "/h/eu-west-1/e/e.yml/eu-west-1",
        "/h/eu-west-1/c/c.yml/eu-west-1",
        "/h/eu-west-1/h/h.yml/eu-west-1",
        "/h/eu-west-1/l/l.yml/eu-west-1",
        "/h/eu-west-1/r/r.yml/eu-west-1",
        "/h/eu-west-1/k/k.yml/eu-west-1",
      ],
    })

    const euWestK = createStack({
      name: "eu-west-1-k",
      path: "/h/eu-west-1/k/k.yml/eu-west-1",
      dependencies: [
        "/h/eu-west-1/e/e.yml/eu-west-1",
        "/h/eu-west-1/c/c.yml/eu-west-1",
      ],
    })

    const euWestL = createStack({
      name: "eu-west-1-l",
      path: "/h/eu-west-1/l/l.yml/eu-west-1",
      dependencies: [],
    })

    const euWestM = createStack({
      name: "eu-west-1-m",
      path: "/h/eu-west-1/m/m.yml/eu-west-1",
      dependencies: [
        "/h/eu-west-1/e/e.yml/eu-west-1",
        "/h/eu-west-1/c/c.yml/eu-west-1",
        "/h/eu-west-1/k/k.yml/eu-west-1",
      ],
    })

    const euWestN = createStack({
      name: "eu-west-1-n",
      path: "/h/eu-west-1/n/n.yml/eu-west-1",
      dependencies: [
        "/h/eu-west-1/l/l.yml/eu-west-1",
        "/h/eu-west-1/c/c.yml/eu-west-1",
        "/h/eu-west-1/b/b.yml/eu-west-1",
        "/h/eu-west-1/i/i.yml/eu-west-1",
        "/h/eu-west-1/h/h.yml/eu-west-1",
      ],
    })

    const euWestO = createStack({
      name: "eu-west-1-o",
      path: "/h/eu-west-1/o/o.yml/eu-west-1",
      dependencies: [
        "/h/eu-west-1/e/e.yml/eu-west-1",
        "/h/us-east-1/i/i.yml/us-east-1",
        "/h/eu-west-1/h/h.yml/eu-west-1",
        "/h/eu-west-1/c/c.yml/eu-west-1",
        "/h/eu-west-1/b/b.yml/eu-west-1",
        "/h/eu-west-1/r/r.yml/eu-west-1",
        "/h/eu-west-1/k/k.yml/eu-west-1",
      ],
    })

    const euWestP = createStack({
      name: "eu-west-1-p",
      path: "/h/eu-west-1/p/p.yml/eu-west-1",
      dependencies: [
        "/h/eu-west-1/l/l.yml/eu-west-1",
        "/h/eu-west-1/c/c.yml/eu-west-1",
      ],
    })

    const euWestQ = createStack({
      name: "eu-west-1-q",
      path: "/h/eu-west-1/q/q.yml/eu-west-1",
      dependencies: [],
    })

    const euWestR = createStack({
      name: "eu-west-1-r",
      path: "/h/eu-west-1/r/r.yml/eu-west-1",
      dependencies: [
        "/h/eu-west-1/e/e.yml/eu-west-1",
        "/h/eu-west-1/c/c.yml/eu-west-1",
      ],
    })

    const euWestS = createStack({
      name: "eu-west-1-s",
      path: "/h/eu-west-1/s/s.yml/eu-west-1",
      dependencies: ["/h/us-east-1/h/h.yml/us-east-1"],
    })

    const usEastG = createStack({
      name: "us-east-1-g",
      path: "/h/us-east-1/g/g.yml/us-east-1",
      dependencies: [],
    })

    const usEastH = createStack({
      name: "us-east-1-h",
      path: "/h/us-east-1/h/h.yml/us-east-1",
      dependencies: [],
    })

    const usEastI = createStack({
      name: "us-east-1-i",
      path: "/h/us-east-1/i/i.yml/us-east-1",
      dependencies: [
        "/h/eu-west-1/l/l.yml/eu-west-1",
        "/h/eu-west-1/e/e.yml/eu-west-1",
      ],
    })

    const usEastS = createStack({
      name: "us-east-1-s",
      path: "/h/us-east-1/s/s.yml/us-east-1",
      dependencies: ["/h/us-east-1/h/h.yml/us-east-1"],
    })

    const sorted = sortStacksForDeploy([
      euNorthA,
      euNorthB,
      usEastS,
      usEastI,
      usEastH,
      usEastG,
      euWestS,
      euWestR,
      euWestQ,
      euWestP,
      euWestO,
      euWestN,
      euWestM,
      euWestL,
      euWestK,
      euWestJ,
      euWestI,
      euWestH,
      euWestG,
      euWestE,
      euWestD,
      euWestC,
      euWestB,
    ]).map((s) => s.path)

    expect(sorted).toStrictEqual([
      euNorthB.path,
      euWestB.path,
      euWestG.path,
      euWestL.path,
      euWestQ.path,
      usEastG.path,
      usEastH.path,
      euNorthA.path,
      euWestS.path,
      usEastS.path,
      euWestC.path,
      euWestE.path,
      euWestD.path,
      euWestH.path,
      euWestK.path,
      euWestP.path,
      euWestR.path,
      usEastI.path,
      euWestI.path,
      euWestJ.path,
      euWestM.path,
      euWestO.path,
      euWestN.path,
    ])
  })
})
