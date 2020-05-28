import { ResolverInput } from "@takomo/stacks-model"
import { ConsoleLogger, LogLevel } from "@takomo/util"
import { mock } from "jest-mock-extended"
import { ResolverRegistry } from "../src"
import { StaticResolver } from "../src/impl"

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

describe("#initResolver", () => {
  test("invokes provider's validate function", async () => {
    const registry = new ResolverRegistry(logger)
    let invoked = false
    await registry.registerBuiltInProvider({
      name: "hello",
      init: async (props: any) => new StaticResolver(props),
      validate: async (props: any): Promise<void> => {
        invoked = true
      },
    })

    await registry.initResolver("hello", {})
    expect(invoked).toBeTruthy()
  })

  test("returns correctly initialized resolver", async () => {
    const registry = new ResolverRegistry(logger)
    await registry.registerBuiltInProvider({
      name: "hello",
      init: async (props: any) => new StaticResolver(props),
    })

    const resolver = await registry.initResolver("hello", "world")
    expect(await resolver.resolve(mock<ResolverInput>())).toBe("world")
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

      const resolver = await registry.initResolver("my-cool-resolver", {
        greeting: "Good day",
      })

      expect(resolver.resolve(mock<ResolverInput>())).toBe("GOOD DAY")
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

  describe("when given a provider with invalid validate", () => {
    test("throws an error", async () => {
      const pathToProvider =
        process.cwd() + "/test/invalid-resolver-bad-validate.js"
      const register = () =>
        new ResolverRegistry(logger).registerProviderFromFile(pathToProvider)

      await expect(register()).rejects.toThrow(
        `Invalid resolver provider configuration in file: ${pathToProvider}:\n\n` +
          "validate is not a function",
      )
    })
  })
})
