import { buildParameters } from "../../../../src/context/config/parameters"
import { ParameterName } from "../../../../src/model"
import { coreResolverInitializers } from "../../../../src/resolver"

const initializers = coreResolverInitializers()

describe("#buildParameters", () => {
  describe("should build correct parameters", () => {
    it("when a an empty config is given", async () => {
      const config = new Map<ParameterName, any>()
      const parameters = await buildParameters(config, initializers)
      expect(parameters.size).toBe(0)
    })

    it("when a static string parameter config is given", async () => {
      const config = new Map<ParameterName, any>([["Param1", "string value"]])
      const parameters = await buildParameters(config, initializers)
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("Param1")
      expect(resolver1?.getName()).toBe("static")
    })

    it("when a static number parameter config is given", async () => {
      const config = new Map<ParameterName, any>([["NumberParam", 1234]])
      const parameters = await buildParameters(config, initializers)
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("NumberParam")
      expect(resolver1?.getName()).toBe("static")
    })

    it("when a static boolean parameter config is given", async () => {
      const config = new Map<ParameterName, any>([["BooleanParam", true]])
      const parameters = await buildParameters(config, initializers)
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("BooleanParam")
      expect(resolver1?.getName()).toBe("static")
    })

    it("when a static string list parameter config is given", async () => {
      const config = new Map<ParameterName, any>([
        ["SubnetIds", ["subnet1", "subnet2", "subnet3"]],
      ])
      const parameters = await buildParameters(config, initializers)
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("SubnetIds")
      expect(resolver1?.getName()).toBe("list")
    })

    it("when a mixed list parameter config is given", async () => {
      const config = new Map<ParameterName, any>([
        [
          "SomeValues",
          ["subnet1", 1, true, { resolver: "secret", secret: "password" }],
        ],
      ])
      const parameters = await buildParameters(config, initializers)
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("SomeValues")
      expect(resolver1?.getName()).toBe("list")
    })
  })
})
