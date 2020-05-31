import { ParameterName } from "@takomo/stacks-model"
import {
  coreResolverProviders,
  ResolverRegistry,
} from "@takomo/stacks-resolvers"
import { ConsoleLogger, LogLevel } from "@takomo/util"
import { buildParameters } from "../../../../src/config/parameters"

const registry = new ResolverRegistry(new ConsoleLogger(LogLevel.DEBUG))
coreResolverProviders().forEach((p) => registry.registerBuiltInProvider(p))

describe("#buildParameters", () => {
  describe("should build correct parameters", () => {
    it("when a an empty config is given", async () => {
      const config = new Map<ParameterName, any>()
      const parameters = await buildParameters(
        "/tmp/file",
        "/stack.yml",
        config,
        registry,
      )
      expect(parameters.size).toBe(0)
    })

    it("when a static string parameter config is given", async () => {
      const config = new Map<ParameterName, any>([["Param1", "string value"]])
      const parameters = await buildParameters(
        "/tmp/file",
        "/stack.yml",
        config,
        registry,
      )
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("Param1")
      expect(resolver1?.getName()).toBe("static")
    })

    it("when a static number parameter config is given", async () => {
      const config = new Map<ParameterName, any>([["NumberParam", 1234]])
      const parameters = await buildParameters(
        "/tmp/file",
        "/stack.yml",
        config,
        registry,
      )
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("NumberParam")
      expect(resolver1?.getName()).toBe("static")
    })

    it("when a static boolean parameter config is given", async () => {
      const config = new Map<ParameterName, any>([["BooleanParam", true]])
      const parameters = await buildParameters(
        "/tmp/file",
        "/stack.yml",
        config,
        registry,
      )
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("BooleanParam")
      expect(resolver1?.getName()).toBe("static")
    })

    it("when a static string list parameter config is given", async () => {
      const config = new Map<ParameterName, any>([
        ["SubnetIds", ["subnet1", "subnet2", "subnet3"]],
      ])
      const parameters = await buildParameters(
        "/tmp/file",
        "/stack.yml",
        config,
        registry,
      )
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("SubnetIds")
      expect(resolver1?.getName()).toBe("list")
    })

    it("when a mixed list parameter config is given", async () => {
      const config = new Map<ParameterName, any>([
        [
          "SomeValues",
          [
            "subnet1",
            1,
            true,
            { resolver: "secret", secret: "password", stack: "/vpc.yml" },
          ],
        ],
      ])

      const parameters = await buildParameters(
        "/tmp/file",
        "/stack.yml",
        config,
        registry,
      )
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("SomeValues")
      expect(resolver1?.getName()).toBe("list")
    })
  })
})
