import Joi from "@hapi/joi"
import { ResolverInput } from "@takomo/stacks-model"
import { ConsoleLogger, LogLevel } from "@takomo/util"
import { mock } from "jest-mock-extended"
import { ResolverRegistry } from "../src"
import { StaticResolver } from "../src/impl/static-resolver"

const logger = new ConsoleLogger(LogLevel.DEBUG)

describe("#registerBuiltInProvider", () => {
  describe("when given a valid provider", () => {
    test("registers provider successfully", async () => {
      const registry = new ResolverRegistry(logger)
      await registry.registerBuiltInProvider({
        name: "static",
        init: async (props: any) => new StaticResolver(props),
      })

      expect(registry.hasProvider("static")).toBeTruthy()
    })
  })
  describe("when given a valid provider with the same resolver name twice", () => {
    test("throws an error", async () => {
      const registry = new ResolverRegistry(logger)
      const register = async () =>
        registry.registerBuiltInProvider({
          name: "static",
          init: async (props: any) => new StaticResolver(props),
        })

      await register()

      await expect(register()).rejects.toThrow(
        "Invalid resolver provider configuration in built-in providers:\n\n" +
          "Resolver provider already registered with name 'static'",
      )
    })
  })
})

describe("#hasProvider", () => {
  describe("when given a non-existing resolver name", () => {
    test("returns false", () => {
      const registry = new ResolverRegistry(logger)
      expect(registry.hasProvider("none")).toBeFalsy()
    })
  })
  describe("when given an existing resolver name", () => {
    test("returns true", async () => {
      const registry = new ResolverRegistry(logger)
      await registry.registerBuiltInProvider({
        name: "hello",
        init: async (props: any) => new StaticResolver(props),
      })
      expect(registry.hasProvider("hello")).toBeTruthy()
    })
  })
})

describe("#getRegisteredResolverNames", () => {
  describe("when no resolvers is registed", () => {
    test("returns an empty array", () => {
      const registry = new ResolverRegistry(logger)
      expect(registry.getRegisteredResolverNames()).toHaveLength(0)
    })
  })
  describe("when some resolvers are registered", () => {
    test("returns resolver names in alphabetical order", async () => {
      const registry = new ResolverRegistry(logger)
      await registry.registerBuiltInProvider({
        name: "hello",
        init: async (props: any) => new StaticResolver(props),
      })
      await registry.registerBuiltInProvider({
        name: "xxxx",
        init: async (props: any) => new StaticResolver(props),
      })
      await registry.registerBuiltInProvider({
        name: "aaaa",
        init: async (props: any) => new StaticResolver(props),
      })
      expect(registry.getRegisteredResolverNames()).toStrictEqual([
        "aaaa",
        "hello",
        "xxxx",
      ])
    })
  })
})

describe("#initResolver", () => {
  test("invokes provider's schema function", async () => {
    const registry = new ResolverRegistry(logger)
    let invoked = false
    await registry.registerBuiltInProvider({
      name: "hello",
      init: async (props: any) => new StaticResolver(props),
      schema: (joi: Joi.Root, base: Joi.ObjectSchema): Joi.ObjectSchema => {
        invoked = true
        return base
      },
    })

    await registry.initResolver("/myfile", "param1", "hello", {})
    expect(invoked).toBeTruthy()
  })

  test("returns correctly initialized resolver", async () => {
    const registry = new ResolverRegistry(logger)
    await registry.registerBuiltInProvider({
      name: "hello",
      init: async (props: any) => new StaticResolver(props),
    })

    const resolver = await registry.initResolver("/myfile", "param1", "hello", {
      value: "world",
    })
    expect(await resolver.resolve(mock<ResolverInput>())).toBe("world")
  })

  test("throws an error if schema function returns other than Joi schema object", async () => {
    const registry = new ResolverRegistry(logger)
    await registry.registerProviderFromFile(
      process.cwd() + "/test/invalid-resolver-bad-schema2.js",
    )

    await expect(
      registry.initResolver(
        "/myfile",
        "param1",
        "invalid-resolver-bad-schema2",
        {},
      ),
    ).rejects.toThrow(
      "Error in parameter 'param1' of stack config file /myfile:\n\n" +
        "  - value returned from resolver schema function is not a Joi schema object",
    )
  })
})

describe("#registerProviderFromFile", () => {
  describe("when given a valid provider", () => {
    test("registers provider successfully", async () => {
      const registry = new ResolverRegistry(logger)
      await registry.registerProviderFromFile(
        process.cwd() + "/test/my-resolver.js",
      )
      expect(registry.hasProvider("my-cool-resolver")).toBeTruthy()

      const resolver = await registry.initResolver(
        "/myfile",
        "param1",
        "my-cool-resolver",
        {
          greeting: "Good day",
        },
      )

      expect(resolver.resolve(mock<ResolverInput>())).toBe("GOOD DAY")
    })

    test("uses schema to validate resolver configuration", async () => {
      const registry = new ResolverRegistry(logger)
      await registry.registerProviderFromFile(
        process.cwd() + "/test/my-resolver.js",
      )
      expect(registry.hasProvider("my-cool-resolver")).toBeTruthy()

      await expect(
        registry.initResolver("/myfile", "param1", "my-cool-resolver", {
          greeting: "I'm too long message",
        }),
      ).rejects.toThrow(
        "1 validation error(s) in parameter 'param1' of stack config file /myfile:\n\n" +
          '  - "greeting" length must be less than or equal to 10 characters long',
      )
    })
  })

  describe("when given a provider without name", () => {
    test("throws an error", async () => {
      const pathToProvider = process.cwd() + "/test/invalid-resolver-no-name.js"
      const register = () =>
        new ResolverRegistry(logger).registerProviderFromFile(pathToProvider)

      await expect(register()).rejects.toThrow(
        `Invalid resolver provider configuration in file: ${pathToProvider}:\n\n` +
          "name property not defined",
      )
    })
  })

  describe("when given a provider without init", () => {
    test("throws an error", async () => {
      const pathToProvider = process.cwd() + "/test/invalid-resolver-no-init.js"
      const register = () =>
        new ResolverRegistry(logger).registerProviderFromFile(pathToProvider)

      await expect(register()).rejects.toThrow(
        `Invalid resolver provider configuration in file: ${pathToProvider}:\n\n` +
          "init function not defined",
      )
    })
  })

  describe("when given a provider with invalid schema", () => {
    test("throws an error", async () => {
      const pathToProvider =
        process.cwd() + "/test/invalid-resolver-bad-schema.js"
      const register = () =>
        new ResolverRegistry(logger).registerProviderFromFile(pathToProvider)

      await expect(register()).rejects.toThrow(
        `Invalid resolver provider configuration in file: ${pathToProvider}:\n\n` +
          "schema is not a function",
      )
    })
  })
})
