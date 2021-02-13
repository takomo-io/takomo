import { StackParameterKey } from "@takomo/aws-model"
import { CommandContext } from "@takomo/core"
import { deepFreeze, FilePath, TakomoError, TkmLogger } from "@takomo/util"
import Joi, { AnySchema } from "joi"
import { StackPath } from "./stack"

/**
 * @hidden
 */
export type SchemaName = string

class CustomSchemaError extends TakomoError {
  constructor(pathToSchemaFile: FilePath, details: string) {
    super(`Invalid schema definition in file: ${pathToSchemaFile} - ${details}`)
  }
}

/**
 * @hidden
 */
export interface InitSchemaProps {
  readonly joi: Joi.Root
  readonly props: Record<string, unknown>
}

/**
 * @hidden
 */
export interface SchemaProps {
  readonly ctx: CommandContext
  readonly joi: Joi.Root
  readonly base: Joi.ObjectSchema
}

/**
 * @hidden
 */
export interface SchemaProvider {
  readonly init: (props: InitSchemaProps) => Promise<AnySchema>
  readonly name: SchemaName | (() => SchemaName)
  readonly schema?: (props: SchemaProps) => Joi.ObjectSchema
}

/**
 * @hidden
 */
export interface SchemaRegistry {
  readonly initParameterSchema: (
    ctx: CommandContext,
    stackPath: StackPath,
    parameterName: StackParameterKey,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
  readonly registerProviderFromFile: (
    pathToResolverFile: FilePath,
  ) => Promise<void>
  readonly hasProvider: (name: SchemaName) => boolean
}

/**
 * @hidden
 */
export const defaultSchema = (schemaName: SchemaName): Joi.ObjectSchema =>
  Joi.object({
    name: Joi.string().valid(schemaName),
  })

/**
 * @hidden
 */
export const createSchemaRegistry = (logger: TkmLogger): SchemaRegistry => {
  const schemas = new Map<SchemaName, SchemaProvider>()
  return deepFreeze({
    registerProviderFromFile: async (
      pathToProviderFile: FilePath,
    ): Promise<void> => {
      logger.debug(`Register schema provider from file: ${pathToProviderFile}`)
      // eslint-disable-next-line
      const provider = require(pathToProviderFile)
      if (!provider.name) {
        throw new CustomSchemaError(
          pathToProviderFile,
          "Expected 'name' property to be defined",
        )
      }
      const nameType = typeof provider.name
      if (nameType !== "string" && nameType !== "function") {
        throw new CustomSchemaError(
          pathToProviderFile,
          "Expected 'name' property to be of type 'string' or 'function'",
        )
      }

      const name =
        typeof provider.name === "function" ? provider.name() : provider.name

      if (schemas.has(name)) {
        throw new CustomSchemaError(
          pathToProviderFile,
          `Schema '${name}' is already registered`,
        )
      }
      if (!provider.init) {
        throw new CustomSchemaError(
          pathToProviderFile,
          "Expected 'init' property to be defined",
        )
      }
      if (typeof provider.init !== "function") {
        throw new CustomSchemaError(
          pathToProviderFile,
          "Expected 'init' property to be of type 'function'",
        )
      }
      if (provider.schema && typeof provider.schema !== "function") {
        throw new CustomSchemaError(
          pathToProviderFile,
          "Expected 'schema' property to be of type 'function'",
        )
      }

      schemas.set(name, provider)
    },

    initParameterSchema: async (
      ctx: CommandContext,
      stackPath: StackPath,
      parameterName: StackParameterKey,
      name: SchemaName,
      props: Record<string, unknown>,
    ): Promise<AnySchema> => {
      logger.debug(
        `Initialize schema '${name}' for parameter '${parameterName}' in stack '${stackPath}'`,
      )
      const provider = schemas.get(name)
      if (!provider) {
        throw new Error(`Provider not found for schema '${name}'`)
      }

      if (provider.schema) {
        const schema = provider.schema({
          ctx,
          joi: Joi.defaults((schema) => schema),
          base: defaultSchema(name),
        })

        if (!Joi.isSchema(schema)) {
          throw new TakomoError(
            `Error initializing schema of parameter '${parameterName}' of stack ${stackPath}:\n\n` +
              `  - value returned from schema function is not a Joi schema object`,
          )
        }

        const { error } = schema.validate(props, { abortEarly: false })
        if (error) {
          const details = error.details
            .map((d) => `  - ${d.message}`)
            .join("\n")
          throw new TakomoError(
            `${error.details.length} validation error(s) in schema configuration of parameter '${parameterName}' of stack ${stackPath}:\n\n${details}`,
          )
        }
      }

      return provider.init({
        joi: Joi.defaults((schema) => schema),
        props,
      })
    },

    hasProvider: (name: SchemaName): boolean => schemas.has(name),
  })
}
