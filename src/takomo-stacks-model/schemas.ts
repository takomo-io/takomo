import Joi, { AnySchema } from "joi"
import { CommandContext } from "../context/command-context"

import { StackPath } from "../stacks/stack"
import { StackGroupPath } from "../stacks/stack-group"
import { StackParameterKey } from "../takomo-aws-model"
import { TakomoError } from "../utils/errors"
import { FilePath } from "../utils/files"
import { TkmLogger } from "../utils/logging"

export type SchemaName = string

class CustomSchemaError extends TakomoError {
  constructor(source: string, details: string) {
    super(`Invalid schema definition in ${source} - ${details}`)
  }
}

export interface InitSchemaProps {
  readonly joi: Joi.Root
  readonly ctx: CommandContext
  readonly props: Record<string, unknown>
}

export interface SchemaProps {
  readonly ctx: CommandContext
  readonly joi: Joi.Root
  readonly base: Joi.ObjectSchema
}

/**
 * An interface to be implemented by objects that initialize Joi schema objects.
 */
export interface SchemaProvider {
  /**
   * Initialize Joi schema
   */
  readonly init: (props: InitSchemaProps) => Promise<AnySchema>

  /**
   * Name of the schema that this provider initializes.
   */
  readonly name: SchemaName | (() => SchemaName)

  /**
   * Create a schema used to validate properties used to initialize a new schema.
   */
  readonly schema?: (props: SchemaProps) => Joi.ObjectSchema
}

export interface SchemaRegistry {
  readonly initParameterSchema: (
    ctx: CommandContext,
    stackPath: StackPath,
    parameterName: StackParameterKey,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
  readonly initStackGroupDataSchema: (
    ctx: CommandContext,
    stackGroupPath: StackGroupPath,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
  readonly initStackGroupTagsSchema: (
    ctx: CommandContext,
    stackGroupPath: StackGroupPath,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
  readonly initStackGroupParametersSchema: (
    ctx: CommandContext,
    stackGroupPath: StackGroupPath,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
  readonly initStackGroupNameSchema: (
    ctx: CommandContext,
    stackGroupPath: StackGroupPath,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
  readonly initStackDataSchema: (
    ctx: CommandContext,
    stackPath: StackPath,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
  readonly initStackTagsSchema: (
    ctx: CommandContext,
    stackPath: StackPath,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
  readonly initStackParametersSchema: (
    ctx: CommandContext,
    stackPath: StackPath,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
  readonly initStackNameSchema: (
    ctx: CommandContext,
    stackPath: StackPath,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
  readonly registerProviderFromFile: (
    pathToResolverFile: FilePath,
  ) => Promise<void>
  readonly registerFromSource: (
    provider: SchemaProvider,
    source: string,
  ) => Promise<void>
  readonly hasProvider: (name: SchemaName) => boolean
  readonly getProvider: (name: SchemaName) => SchemaProvider | undefined
}

export const defaultSchema = (schemaName: SchemaName): Joi.ObjectSchema =>
  Joi.object({
    name: Joi.string().valid(schemaName),
  })

export const createSchemaRegistry = (logger: TkmLogger): SchemaRegistry => {
  const schemas = new Map<SchemaName, SchemaProvider>()

  const getProvider = (name: SchemaName): SchemaProvider | undefined =>
    schemas.get(name)

  const registerProvider = async (
    provider: SchemaProvider,
    source: string,
  ): Promise<void> => {
    if (!provider.name) {
      throw new CustomSchemaError(
        source,
        "Expected 'name' property to be defined",
      )
    }
    const nameType = typeof provider.name
    if (nameType !== "string" && nameType !== "function") {
      throw new CustomSchemaError(
        source,
        "Expected 'name' property to be of type 'string' or 'function'",
      )
    }

    const name =
      typeof provider.name === "function" ? provider.name() : provider.name

    if (schemas.has(name)) {
      throw new CustomSchemaError(
        source,
        `Schema '${name}' is already registered`,
      )
    }
    if (!provider.init) {
      throw new CustomSchemaError(
        source,
        "Expected 'init' property to be defined",
      )
    }
    if (typeof provider.init !== "function") {
      throw new CustomSchemaError(
        source,
        "Expected 'init' property to be of type 'function'",
      )
    }
    if (provider.schema && typeof provider.schema !== "function") {
      throw new CustomSchemaError(
        source,
        "Expected 'schema' property to be of type 'function'",
      )
    }

    schemas.set(name, provider)
  }

  return {
    registerProviderFromFile: async (
      pathToProviderFile: FilePath,
    ): Promise<void> => {
      logger.debug(`Register schema provider from file: ${pathToProviderFile}`)
      // eslint-disable-next-line
      const provider = require(pathToProviderFile)
      await registerProvider(provider, `file: ${pathToProviderFile}`)
    },

    registerFromSource: async (
      provider: SchemaProvider,
      source: string,
    ): Promise<void> => {
      await registerProvider(provider, source)
    },

    getProvider,

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

        const { error } = schema.validate(props, {
          abortEarly: false,
          convert: false,
        })
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
        ctx,
        props,
      })
    },

    initStackGroupTagsSchema: (
      ctx: CommandContext,
      stackGroupPath: StackGroupPath,
      name: SchemaName,
      props: Record<string, unknown>,
    ): Promise<AnySchema> => {
      logger.debug(
        `Initialize tags schema '${name}' for stack group '${stackGroupPath}'`,
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
            `Error initializing tags schema for stack group '${stackGroupPath}':\n\n` +
              `  - value returned from schema function is not a Joi schema object`,
          )
        }

        const { error } = schema.validate(props, {
          abortEarly: false,
          convert: false,
        })
        if (error) {
          const details = error.details
            .map((d) => `  - ${d.message}`)
            .join("\n")
          throw new TakomoError(
            `${error.details.length} validation error(s) in tags schema configuration of stack group '${stackGroupPath}':\n\n${details}`,
          )
        }
      }

      return provider.init({
        joi: Joi.defaults((schema) => schema),
        ctx,
        props,
      })
    },

    initStackGroupParametersSchema: (
      ctx: CommandContext,
      stackGroupPath: StackGroupPath,
      name: SchemaName,
      props: Record<string, unknown>,
    ): Promise<AnySchema> => {
      logger.debug(
        `Initialize parameters schema '${name}' for stack group '${stackGroupPath}'`,
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
            `Error initializing parameters schema for stack group '${stackGroupPath}':\n\n` +
              `  - value returned from schema function is not a Joi schema object`,
          )
        }

        const { error } = schema.validate(props, {
          abortEarly: false,
          convert: false,
        })
        if (error) {
          const details = error.details
            .map((d) => `  - ${d.message}`)
            .join("\n")
          throw new TakomoError(
            `${error.details.length} validation error(s) in parameters schema configuration of stack group '${stackGroupPath}':\n\n${details}`,
          )
        }
      }

      return provider.init({
        joi: Joi.defaults((schema) => schema),
        ctx,
        props,
      })
    },

    initStackGroupNameSchema: (
      ctx: CommandContext,
      stackGroupPath: StackGroupPath,
      name: SchemaName,
      props: Record<string, unknown>,
    ): Promise<AnySchema> => {
      logger.debug(
        `Initialize name schema '${name}' for stack group '${stackGroupPath}'`,
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
            `Error initializing name schema for stack group '${stackGroupPath}':\n\n` +
              `  - value returned from schema function is not a Joi schema object`,
          )
        }

        const { error } = schema.validate(props, {
          abortEarly: false,
          convert: false,
        })
        if (error) {
          const details = error.details
            .map((d) => `  - ${d.message}`)
            .join("\n")
          throw new TakomoError(
            `${error.details.length} validation error(s) in name schema configuration of stack group '${stackGroupPath}':\n\n${details}`,
          )
        }
      }

      return provider.init({
        joi: Joi.defaults((schema) => schema),
        ctx,
        props,
      })
    },

    initStackGroupDataSchema: (
      ctx: CommandContext,
      stackGroupPath: StackGroupPath,
      name: SchemaName,
      props: Record<string, unknown>,
    ): Promise<AnySchema> => {
      logger.debug(
        `Initialize data schema '${name}' for stack group '${stackGroupPath}'`,
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
            `Error initializing data schema for stack group '${stackGroupPath}':\n\n` +
              `  - value returned from schema function is not a Joi schema object`,
          )
        }

        const { error } = schema.validate(props, {
          abortEarly: false,
          convert: false,
        })
        if (error) {
          const details = error.details
            .map((d) => `  - ${d.message}`)
            .join("\n")
          throw new TakomoError(
            `${error.details.length} validation error(s) in data schema configuration of stack group '${stackGroupPath}':\n\n${details}`,
          )
        }
      }

      return provider.init({
        joi: Joi.defaults((schema) => schema),
        ctx,
        props,
      })
    },

    initStackDataSchema: (
      ctx: CommandContext,
      stackPath: StackPath,
      name: SchemaName,
      props: Record<string, unknown>,
    ): Promise<AnySchema> => {
      logger.debug(`Initialize data schema '${name}' for stack '${stackPath}'`)
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
            `Error initializing data schema for stack '${stackPath}':\n\n` +
              `  - value returned from schema function is not a Joi schema object`,
          )
        }

        const { error } = schema.validate(props, {
          abortEarly: false,
          convert: false,
        })
        if (error) {
          const details = error.details
            .map((d) => `  - ${d.message}`)
            .join("\n")
          throw new TakomoError(
            `${error.details.length} validation error(s) in data schema configuration of stack '${stackPath}':\n\n${details}`,
          )
        }
      }

      return provider.init({
        joi: Joi.defaults((schema) => schema),
        ctx,
        props,
      })
    },

    initStackTagsSchema: (
      ctx: CommandContext,
      stackPath: StackPath,
      name: SchemaName,
      props: Record<string, unknown>,
    ): Promise<AnySchema> => {
      logger.debug(`Initialize tags schema '${name}' for stack '${stackPath}'`)
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
            `Error initializing tags schema for stack '${stackPath}':\n\n` +
              `  - value returned from schema function is not a Joi schema object`,
          )
        }

        const { error } = schema.validate(props, {
          abortEarly: false,
          convert: false,
        })
        if (error) {
          const details = error.details
            .map((d) => `  - ${d.message}`)
            .join("\n")
          throw new TakomoError(
            `${error.details.length} validation error(s) in tags schema configuration of stack '${stackPath}':\n\n${details}`,
          )
        }
      }

      return provider.init({
        joi: Joi.defaults((schema) => schema),
        ctx,
        props,
      })
    },

    initStackParametersSchema: (
      ctx: CommandContext,
      stackPath: StackPath,
      name: SchemaName,
      props: Record<string, unknown>,
    ): Promise<AnySchema> => {
      logger.debug(
        `Initialize parameters schema '${name}' for stack '${stackPath}'`,
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
            `Error initializing parameters schema for stack '${stackPath}':\n\n` +
              `  - value returned from schema function is not a Joi schema object`,
          )
        }

        const { error } = schema.validate(props, {
          abortEarly: false,
          convert: false,
        })
        if (error) {
          const details = error.details
            .map((d) => `  - ${d.message}`)
            .join("\n")
          throw new TakomoError(
            `${error.details.length} validation error(s) in parameters schema configuration of stack '${stackPath}':\n\n${details}`,
          )
        }
      }

      return provider.init({
        joi: Joi.defaults((schema) => schema),
        ctx,
        props,
      })
    },

    initStackNameSchema: (
      ctx: CommandContext,
      stackPath: StackPath,
      name: SchemaName,
      props: Record<string, unknown>,
    ): Promise<AnySchema> => {
      logger.debug(`Initialize name schema '${name}' for stack '${stackPath}'`)
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
            `Error initializing name schema for stack '${stackPath}':\n\n` +
              `  - value returned from schema function is not a Joi schema object`,
          )
        }

        const { error } = schema.validate(props, {
          abortEarly: false,
          convert: false,
        })
        if (error) {
          const details = error.details
            .map((d) => `  - ${d.message}`)
            .join("\n")
          throw new TakomoError(
            `${error.details.length} validation error(s) in name schema configuration of stack '${stackPath}':\n\n${details}`,
          )
        }
      }

      return provider.init({
        joi: Joi.defaults((schema) => schema),
        ctx,
        props,
      })
    },

    hasProvider: (name: SchemaName): boolean => schemas.has(name),
  }
}

export interface Schemas {
  readonly data: ReadonlyArray<AnySchema>
  readonly tags: ReadonlyArray<AnySchema>
  readonly name: ReadonlyArray<AnySchema>
  readonly parameters: ReadonlyArray<AnySchema>
}
