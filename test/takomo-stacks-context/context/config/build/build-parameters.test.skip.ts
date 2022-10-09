import { mock } from "jest-mock-extended"
import { StackParameterKey } from "../../../../../src/takomo-aws-model"
import { CommandContext } from "../../../../../src/takomo-core"
import {
  ListParameterConfig,
  ParameterConfigs,
  SingleParameterConfig,
} from "../../../../../src/takomo-stacks-config"
import { buildParameters } from "../../../../../src/takomo-stacks-context/config/parameters"
import { SchemaRegistry } from "../../../../../src/takomo-stacks-model"
import {
  coreResolverProviders,
  ResolverRegistry,
} from "../../../../../src/takomo-stacks-resolvers"
import { createConsoleLogger } from "../../../../../src/takomo-util"

const logger = createConsoleLogger({
  logLevel: "info",
})

const registry = new ResolverRegistry(logger)
coreResolverProviders().forEach((p) => registry.registerBuiltInProvider(p))

const schemaRegistry = mock<SchemaRegistry>()

describe("#buildParameters", () => {
  describe("should build correct parameters", () => {
    it("when a an empty config is given", async () => {
      const config = new Map<StackParameterKey, ParameterConfigs>()
      const parameters = await buildParameters(
        mock<CommandContext>(),
        "/stack.yml",
        config,
        registry,
        schemaRegistry,
      )
      expect(parameters.size).toBe(0)
    })

    it("when a static string parameter config is given", async () => {
      const config = new Map<StackParameterKey, ParameterConfigs>([
        [
          "Param1",
          new SingleParameterConfig({
            immutable: false,
            resolver: "static",
            value: "string value",
          }),
        ],
      ])

      const parameters = await buildParameters(
        mock<CommandContext>(),
        "/stack.yml",
        config,
        registry,
        schemaRegistry,
      )
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("Param1")!
      expect(resolver1.getName()).toBe("static")
      expect(resolver1.isConfidential()).toBe(false)
      expect(resolver1.isImmutable()).toBe(false)
    })

    it("when a static number parameter config is given", async () => {
      const config = new Map<StackParameterKey, ParameterConfigs>([
        [
          "NumberParam",
          new SingleParameterConfig({
            immutable: false,
            resolver: "static",
            value: 1234,
          }),
        ],
      ])
      const parameters = await buildParameters(
        mock<CommandContext>(),
        "/stack.yml",
        config,
        registry,
        schemaRegistry,
      )
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("NumberParam")!
      expect(resolver1.getName()).toBe("static")
    })

    it("when a static boolean parameter config is given", async () => {
      const config = new Map<StackParameterKey, ParameterConfigs>([
        [
          "BooleanParam",
          new SingleParameterConfig({
            immutable: false,
            resolver: "static",
            value: true,
          }),
        ],
      ])
      const parameters = await buildParameters(
        mock<CommandContext>(),
        "/stack.yml",
        config,
        registry,
        schemaRegistry,
      )
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("BooleanParam")!
      expect(resolver1.getName()).toBe("static")
    })

    it("when a static string list parameter config is given", async () => {
      const config = new Map<StackParameterKey, ParameterConfigs>([
        [
          "SubnetIds",
          new ListParameterConfig({
            immutable: false,
            items: [
              {
                immutable: false,
                resolver: "static",
                value: "subnet1",
              },
              {
                immutable: false,
                resolver: "static",
                value: "subnet2",
              },
              {
                immutable: false,
                resolver: "static",
                value: "subnet3",
              },
            ],
          }),
        ],
      ])
      const parameters = await buildParameters(
        mock<CommandContext>(),
        "/stack.yml",
        config,
        registry,
        schemaRegistry,
      )
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("SubnetIds")!
      expect(resolver1.getName()).toBe("list")
    })

    it("when a mixed list parameter config is given", async () => {
      const config = new Map<StackParameterKey, ParameterConfigs>([
        [
          "SomeValues",
          new ListParameterConfig({
            immutable: false,
            items: [
              {
                immutable: false,
                resolver: "static",
                value: "subnet1",
              },
              {
                immutable: false,
                resolver: "static",
                value: 1,
              },
              {
                immutable: false,
                resolver: "static",
                value: true,
              },
            ],
          }),
        ],
      ])

      const parameters = await buildParameters(
        mock<CommandContext>(),
        "/stack.yml",
        config,
        registry,
        schemaRegistry,
      )
      expect(parameters.size).toBe(1)

      const resolver1 = parameters.get("SomeValues")!
      expect(resolver1.getName()).toBe("list")
    })
  })
})
