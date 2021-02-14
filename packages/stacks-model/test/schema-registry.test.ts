import { CommandContext } from "@takomo/core"
import { createConsoleLogger } from "@takomo/util"
import { mock } from "jest-mock-extended"
import { createSchemaRegistry } from "../src"

const logger = createConsoleLogger({ logLevel: "info" })

describe("SchemaRegistry#hasProvider", () => {
  it("return false if the given schema is not registered", () => {
    const sr = createSchemaRegistry(logger)
    expect(sr.hasProvider("my-schema")).toStrictEqual(false)
  })
  it("return true if the given schema is registered", async () => {
    const sr = createSchemaRegistry(logger)
    await sr.registerProviderFromFile(
      `${process.cwd()}/test/schema-files/my-schema.js`,
    )
    expect(sr.hasProvider("my-schema")).toStrictEqual(true)
  })
})

describe("SchemaRegistry#registerProviderFromFile", () => {
  const sr = createSchemaRegistry(logger)
  it("fails when schema file is empty", async () => {
    const pathToSchema = `${process.cwd()}/test/schema-files/empty.js`
    await expect(async () =>
      sr.registerProviderFromFile(pathToSchema),
    ).rejects.toThrow(
      `Invalid schema definition in file: ${pathToSchema} - Expected 'name' property to be defined`,
    )
  })
  it("fails when schema file has name property of invalid type", async () => {
    const pathToSchema = `${process.cwd()}/test/schema-files/invalid-name-type.js`
    await expect(async () =>
      sr.registerProviderFromFile(pathToSchema),
    ).rejects.toThrow(
      `Invalid schema definition in file: ${pathToSchema} - Expected 'name' property to be of type 'string' or 'function'`,
    )
  })
  it("fails when schema file has no init function", async () => {
    const pathToSchema = `${process.cwd()}/test/schema-files/missing-init.js`
    await expect(async () =>
      sr.registerProviderFromFile(pathToSchema),
    ).rejects.toThrow(
      `Invalid schema definition in file: ${pathToSchema} - Expected 'init' property to be defined`,
    )
  })
  it("fails when schema file has init of invalid type", async () => {
    const pathToSchema = `${process.cwd()}/test/schema-files/invalid-init-type.js`
    await expect(async () =>
      sr.registerProviderFromFile(pathToSchema),
    ).rejects.toThrow(
      `Invalid schema definition in file: ${pathToSchema} - Expected 'init' property to be of type 'function'`,
    )
  })
})

describe("SchemaRegistry#registerProviderFromFile", () => {
  it("succeeds when schema file has name property of type string", async () => {
    const pathToSchema = `${process.cwd()}/test/schema-files/my-schema.js`
    const sr = createSchemaRegistry(logger)
    await sr.registerProviderFromFile(pathToSchema)
    expect(sr.hasProvider("my-schema")).toStrictEqual(true)
  })
  it("succeeds when schema file has name property of type function", async () => {
    const pathToSchema = `${process.cwd()}/test/schema-files/my-schema-f.js`
    const sr = createSchemaRegistry(logger)
    await sr.registerProviderFromFile(pathToSchema)
    expect(sr.hasProvider("my-schema-f")).toStrictEqual(true)
  })
  it("succeeds when schema file has schema property", async () => {
    const pathToSchema = `${process.cwd()}/test/schema-files/my-schema-with-schema.js`
    const sr = createSchemaRegistry(logger)
    await sr.registerProviderFromFile(pathToSchema)
    expect(sr.hasProvider("my-schema-with-schema")).toStrictEqual(true)
  })
})

describe("SchemaRegistry#initParameterSchema", () => {
  it("succeeds", async () => {
    const pathToSchema = `${process.cwd()}/test/schema-files/my-schema.js`
    const sr = createSchemaRegistry(logger)
    await sr.registerProviderFromFile(pathToSchema)
    const schema = await sr.initParameterSchema(
      mock<CommandContext>(),
      "/stack.yml/eu-west-1",
      "Param",
      "my-schema",
      {},
    )

    expect(schema).toBeDefined()
  })

  it("fails when schema property doesn't match the given schema", async () => {
    const pathToSchema = `${process.cwd()}/test/schema-files/max-length.js`
    const sr = createSchemaRegistry(logger)
    await sr.registerProviderFromFile(pathToSchema)
    await expect(async () =>
      sr.initParameterSchema(
        mock<CommandContext>(),
        "/stack.yml/eu-west-1",
        "Param",
        "maxLength",
        {},
      ),
    ).rejects.toThrow(
      "1 validation error(s) in schema configuration of parameter 'Param' of stack /stack.yml/eu-west-1:\n\n" +
        '  - "max" is required',
    )

    await expect(async () =>
      sr.initParameterSchema(
        mock<CommandContext>(),
        "/stack.yml/eu-west-1",
        "Param",
        "maxLength",
        { max: 40 },
      ),
    ).rejects.toThrow(
      "1 validation error(s) in schema configuration of parameter 'Param' of stack /stack.yml/eu-west-1:\n\n" +
        '  - "max" must be less than or equal to 20',
    )
  })

  it("fails when schema function does not return Joi object", async () => {
    const pathToSchema = `${process.cwd()}/test/schema-files/invalid-schema-return-type.js`
    const sr = createSchemaRegistry(logger)
    await sr.registerProviderFromFile(pathToSchema)
    await expect(async () =>
      sr.initParameterSchema(
        mock<CommandContext>(),
        "/stack.yml/eu-west-1",
        "Param",
        "invalid-schema-return-type",
        {},
      ),
    ).rejects.toThrow(
      "Error initializing schema of parameter 'Param' of stack /stack.yml/eu-west-1:\n\n" +
        "  - value returned from schema function is not a Joi schema object",
    )
  })
})
