import { processStackDependencies } from "../../../src/context/dependencies"
import { createStackConfig } from "../../helpers"

describe("process stack config dependencies", () => {
  describe("when a single stack config with no dependencies is given", () => {
    test("returns unchanged dependencies list", () => {
      const stackConfigs = [createStackConfig("/subnets.yml/eu-west-1")]

      const [sc] = processStackDependencies(stackConfigs)
      expect(sc.getDependencies()).toStrictEqual([])
    })
  })

  describe("when a dependency between two stacks is defined with exact path", () => {
    test("returns unchanged dependencies lists", () => {
      const a = createStackConfig("/vpc.yml/eu-west-1")
      const b = createStackConfig("/subnets.yml/eu-west-1", [
        "/vpc.yml/eu-west-1",
      ])

      const [a1, b1] = processStackDependencies([a, b])
      expect(a1.getDependencies()).toStrictEqual([])
      expect(b1.getDependencies()).toStrictEqual([a1.getPath()])
    })
  })

  describe("when a dependency between two stacks is defined with partial path", () => {
    test("returns modified dependencies lists", () => {
      const a = createStackConfig("/vpc.yml/eu-west-1")
      const b = createStackConfig("/subnets.yml/eu-west-1", ["/vpc.yml"])

      const [a1, b1] = processStackDependencies([a, b])
      expect(a1.getDependencies()).toStrictEqual([])
      expect(b1.getDependencies()).toStrictEqual([a1.getPath()])
    })
  })

  describe("when a dependency between stacks is defined with partial path", () => {
    test("returns modified dependencies lists", () => {
      const a = createStackConfig("/vpc.yml/eu-west-1")
      const b = createStackConfig("/vpc.yml/us-east-1")
      const c = createStackConfig("/subnets.yml/eu-west-1", ["/vpc.yml"])

      const [a1, b1, c1] = processStackDependencies([a, b, c])
      expect(a1.getDependencies()).toStrictEqual([])
      expect(b1.getDependencies()).toStrictEqual([])
      expect(c1.getDependencies()).toStrictEqual([a1.getPath(), b1.getPath()])
    })
  })

  describe("when multiple dependencies between stacks are defined", () => {
    test("returns correct dependencies lists", () => {
      const a = createStackConfig("/kms.yml/eu-north-1", [
        "/network/vpc.yml/eu-central-1",
      ])
      const b = createStackConfig("/network/vpc.yml/eu-central-1")
      const c = createStackConfig("/network/vpc.yml/eu-west-1")
      const d = createStackConfig("/apps/webshop/app.yml/eu-west-1", [
        "/apps/common.yml",
        "/network/vpc.yml",
      ])
      const e = createStackConfig("/apps/common.yml/us-east-1")

      const [a1, b1, c1, d1, e1] = processStackDependencies([a, b, c, d, e])
      expect(a1.getDependencies()).toStrictEqual([
        "/network/vpc.yml/eu-central-1",
      ])
      expect(b1.getDependencies()).toStrictEqual([])
      expect(c1.getDependencies()).toStrictEqual([])
      expect(d1.getDependencies()).toStrictEqual([
        "/apps/common.yml/us-east-1",
        "/network/vpc.yml/eu-central-1",
        "/network/vpc.yml/eu-west-1",
      ])
      expect(e1.getDependencies()).toStrictEqual([])
    })
  })
})
