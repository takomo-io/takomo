import { Resolver, ResolverName, ResolverProvider } from "@takomo/stacks-model"
import { Logger, TakomoError, TakomoErrorOptions } from "@takomo/util"

class InvalidResolverProviderConfigurationFileError extends TakomoError {
  constructor(
    pathToResolverFile: string,
    details: string,
    options?: TakomoErrorOptions,
  ) {
    super(
      `Invalid resolver provider configuration in file: ${pathToResolverFile}\n\n${details}`,
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

  registerProviderFromFile = async (
    pathToResolverFile: string,
  ): Promise<void> => {
    this.logger.debug(
      `Register resolver provider from file: ${pathToResolverFile}`,
    )

    // eslint-disable-next-line
    const provider = require(pathToResolverFile)
    if (provider.name === undefined || provider.name === null) {
      throw new InvalidResolverProviderConfigurationFileError(
        pathToResolverFile,
        "name property not defined",
        {
          info:
            "name property defines name for the resolver. " +
            "It can be either a string or a function that returns a string",
        },
      )
    }

    if (provider.init === undefined || provider.init === null) {
      throw new InvalidResolverProviderConfigurationFileError(
        pathToResolverFile,
        "init function not defined",
      )
    }

    if (typeof provider.init !== "function") {
      throw new InvalidResolverProviderConfigurationFileError(
        pathToResolverFile,
        "init is not a function",
      )
    }

    if (provider.validate && typeof provider.validate !== "function") {
      throw new InvalidResolverProviderConfigurationFileError(
        pathToResolverFile,
        "validate is not a function",
      )
    }

    if (typeof provider.init !== "function") {
      throw new InvalidResolverProviderConfigurationFileError(
        pathToResolverFile,
        "init function not defined",
      )
    }

    const nameType = typeof provider.name
    if (nameType !== "string" && nameType !== "function") {
      throw new InvalidResolverProviderConfigurationFileError(
        pathToResolverFile,
        "name property has invalid type",
        {
          info:
            "name property defines name for the resolver. " +
            "It can be either a string or a function that returns a string",
        },
      )
    }

    this.registerProvider(provider)
  }

  registerProvider = (provider: ResolverProvider): void => {
    const name =
      typeof provider.name === "function" ? provider.name() : provider.name
    if (this.hasProvider(name)) {
      throw new Error(
        `Resolver provider already registered with name '${name}'`,
      )
    }

    this.providers.set(name, provider)
  }

  hasProvider = (name: ResolverName): boolean => this.providers.has(name)

  initResolver = async (name: ResolverName, props: any): Promise<Resolver> => {
    this.logger.debugObject(`Init resolver '${name}':`, props)
    const provider = this.getProvider(name)
    if (provider.validate) {
      await provider.validate(props)
    }

    return provider.init(props)
  }

  private getProvider = (name: ResolverName): ResolverProvider => {
    const provider = this.providers.get(name)
    if (!provider) {
      throw new Error(`No provider found for resolver with name '${name}'`)
    }

    return provider
  }
}
