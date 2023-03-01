import { processStackDependencies } from "../../../../src/takomo-stacks-context/dependencies.js"
import { createStack } from "../../helpers.js"

describe("process stack config dependencies", () => {
  describe("when a single stack config with no dependencies is given", () => {
    test("returns unchanged dependencies list", () => {
      const stackConfigs = [
        createStack({ path: "/subnets.yml/eu-west-1", name: "" }),
      ]

      const [sc] = processStackDependencies(stackConfigs)
      expect(sc.dependencies).toStrictEqual([])
    })
  })

  describe("when a dependency between two stacks is defined with exact path", () => {
    test("returns unchanged dependencies lists", () => {
      const a = createStack({ path: "/vpc.yml/eu-west-1", name: "" })
      const b = createStack({
        path: "/subnets.yml/eu-west-1",
        name: "",
        dependencies: ["/vpc.yml/eu-west-1"],
      })

      const [a1, b1] = processStackDependencies([a, b])
      expect(a1.dependencies).toStrictEqual([])
      expect(b1.dependencies).toStrictEqual([a1.path])
    })
  })

  describe("when a dependency between two stacks is defined with partial path", () => {
    test("returns modified dependencies lists", () => {
      const a = createStack({ path: "/vpc.yml/eu-west-1", name: "" })
      const b = createStack({
        path: "/subnets.yml/eu-west-1",
        name: "",
        dependencies: ["/vpc.yml"],
      })

      const [a1, b1] = processStackDependencies([a, b])
      expect(a1.dependencies).toStrictEqual([])
      expect(b1.dependencies).toStrictEqual([a1.path])
    })
  })

  describe("when a dependency between stacks is defined with partial path", () => {
    test("returns modified dependencies lists", () => {
      const a = createStack({ path: "/vpc.yml/eu-west-1", name: "" })
      const b = createStack({ path: "/vpc.yml/us-east-1", name: "" })
      const c = createStack({
        path: "/subnets.yml/eu-west-1",
        name: "",
        dependencies: ["/vpc.yml"],
      })

      const [a1, b1, c1] = processStackDependencies([a, b, c])
      expect(a1.dependencies).toStrictEqual([])
      expect(b1.dependencies).toStrictEqual([])
      expect(c1.dependencies).toStrictEqual([a1.path, b1.path])
    })
  })

  describe("when multiple dependencies between stacks are defined", () => {
    test("returns correct dependencies lists", () => {
      const a = createStack({
        path: "/kms.yml/eu-north-1",
        name: "",
        dependencies: ["/network/vpc.yml/eu-central-1"],
      })
      const b = createStack({ path: "/network/vpc.yml/eu-central-1", name: "" })
      const c = createStack({ path: "/network/vpc.yml/eu-west-1", name: "" })
      const d = createStack({
        path: "/apps/webshop/app.yml/eu-west-1",
        name: "",
        dependencies: ["/apps/common.yml", "/network/vpc.yml"],
      })
      const e = createStack({ path: "/apps/common.yml/us-east-1", name: "" })

      const [a1, b1, c1, d1, e1] = processStackDependencies([a, b, c, d, e])
      expect(a1.dependencies).toStrictEqual(["/network/vpc.yml/eu-central-1"])
      expect(b1.dependencies).toStrictEqual([])
      expect(c1.dependencies).toStrictEqual([])
      expect(d1.dependencies).toStrictEqual([
        "/apps/common.yml/us-east-1",
        "/network/vpc.yml/eu-central-1",
        "/network/vpc.yml/eu-west-1",
      ])
      expect(e1.dependencies).toStrictEqual([])
    })
  })
})
