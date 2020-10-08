import { Resolver, ResolverName, ResolverProvider } from "@takomo/stacks-model"
import { Logger, TakomoError, TakomoErrorOptions } from "@takomo/util"
import Joi from "joi"

class InvalidResolverProviderConfigurationError extends TakomoError {
  constructor(
    sourceDescription: string,
    details: string,
    options?: TakomoErrorOptions,
  ) {
    super(
      `Invalid resolver provider configuration in ${sourceDescription}:\n\n${details}`,
      options,
    )
  }
}

export class ResolverRegistry {
  private readonly providers: Map<ResolverName, ResolverProvider> = new Map()
  private readonly logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  hasProvider = (name: ResolverName): boolean => this.providers.has(name)

  initResolver = async (
    filePath: string,
    parameterName: string,
    name: ResolverName,
    props: any,
  ): Promise<Resolver> => {
    if (props.confidential === true) {
      this.logger.debug(
        `Init resolver '${name}' for parameter '${parameterName}' with properties: <concealed>`,
      )
    } else {
      this.logger.debugObject(
        `Init resolver '${name}' for parameter '${parameterName}' with properties:`,
        props,
      )
    }

    const provider = this.getProvider(name)
    if (provider.schema) {
      const schema = provider.schema(
        Joi.defaults((schema) => schema),
        Joi.object({ resolver: Joi.string().valid(name) }),
      )

      if (!Joi.isSchema(schema)) {
        throw new TakomoError(
          `Error in parameter '${parameterName}' of stack config file ${filePath}:\n\n` +
            `  - value returned from resolver schema function is not a Joi schema object`,
        )
      }

      const { error } = schema.validate(props, { abortEarly: false })
      if (error) {
        const details = error.details.map((d) => `  - ${d.message}`).join("\n")
        throw new TakomoError(
          `${error.details.length} validation error(s) in parameter '${parameterName}' of stack config file ${filePath}:\n\n${details}`,
        )
      }
    }

    return provider.init(props)
  }

  registerProviderFromFile = async (
    pathToResolverFile: string,
  ): Promise<void> => {
    // eslint-disable-next-line
    const provider = require(pathToResolverFile)
    return this.registerProvider(provider, `file: ${pathToResolverFile}`)
  }

  registerBuiltInProvider = async (
    provider: ResolverProvider,
  ): Promise<void> => {
    return this.registerProvider(provider, "built-in providers")
  }

  getRegisteredResolverNames = (): ResolverName[] =>
    Array.from(this.providers.keys()).sort()

  private registerProvider = (
    provider: any,
    sourceDescription: string,
  ): void => {
    this.logger.debug(`Register resolver provider from ${sourceDescription}`)

    if (provider.name === undefined || provider.name === null) {
      throw new InvalidResolverProviderConfigurationError(
        sourceDescription,
        "name property not defined",
        {
          info:
            "name property defines name for the resolver. " +
            "It can be either a string or a function that returns a string",
        },
      )
    }

    if (provider.init === undefined || provider.init === null) {
      throw new InvalidResolverProviderConfigurationError(
        sourceDescription,
        "init function not defined",
      )
    }

    if (typeof provider.init !== "function") {
      throw new InvalidResolverProviderConfigurationError(
        sourceDescription,
        "init is not a function",
      )
    }

    if (provider.schema && typeof provider.schema !== "function") {
      throw new InvalidResolverProviderConfigurationError(
        sourceDescription,
        "schema is not a function",
      )
    }

    const nameType = typeof provider.name
    if (nameType !== "string" && nameType !== "function") {
      throw new InvalidResolverProviderConfigurationError(
        sourceDescription,
        "name property has invalid type",
        {
          info:
            "name property defines name for the resolver. " +
            "It can be either a string or a function that returns a string",
        },
      )
    }

    const name =
      typeof provider.name === "function" ? provider.name() : provider.name
    if (this.hasProvider(name)) {
      throw new InvalidResolverProviderConfigurationError(
        sourceDescription,
        `Resolver provider already registered with name '${name}'`,
      )
    }

    this.logger.debug(
      `Registered resolver provider from ${sourceDescription} with name '${name}'`,
    )
    this.providers.set(name, provider)
  }

  private getProvider = (name: ResolverName): ResolverProvider => {
    const provider = this.providers.get(name)
    if (!provider) {
      throw new Error(`No provider found for resolver with name '${name}'`)
    }

    return provider
  }
}
