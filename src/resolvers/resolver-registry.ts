import Joi from "joi"
import { StackParameterKey } from "../aws/cloudformation/model.js"
import { ParameterConfig } from "../config/common-config.js"
import { ExternalResolverConfig } from "../config/project-config.js"
import { CommandContext } from "../context/command-context.js"
import { StackPath } from "../stacks/stack.js"
import { TakomoError, TakomoErrorProps } from "../utils/errors.js"
import { TkmLogger } from "../utils/logging.js"
import { createCmdResolverProvider } from "./cmd-resolver.js"
import { createExternalStackOutputResolverProvider } from "./external-stack-output-resolver.js"
import { createFileContentsResolverProvider } from "./file-contents-resolver.js"
import { createHookOutputResolverProvider } from "./hook-output-resolver.js"
import { ResolverProvider } from "./resolver-provider.js"
import { Resolver, ResolverName } from "./resolver.js"
import { createSecretResolverProvider } from "./secret-resolver.js"
import { createSsmResolverProvider } from "./ssm-resolver.js"
import { createStackOutputResolverProvider } from "./stack-output-resolver.js"
import { createStaticResolverProvider } from "./static-resolver.js"

class InvalidResolverProviderConfigurationError extends TakomoError {
  constructor(
    sourceDescription: string,
    details: string,
    options?: TakomoErrorProps,
  ) {
    super(
      `Invalid resolver provider configuration in ${sourceDescription}:\n\n${details}`,
      options,
    )
  }
}

export const defaultSchema = (resolverName: string): Joi.ObjectSchema =>
  Joi.object({
    resolver: Joi.string().valid(resolverName),
    confidential: Joi.boolean(),
    immutable: Joi.boolean(),
    schema: [
      Joi.string(),
      Joi.object({ name: Joi.string().required() }).unknown(true),
    ],
  })

export class ResolverRegistry {
  private readonly providers: Map<ResolverName, ResolverProvider> = new Map()
  private readonly logger: TkmLogger

  constructor(logger: TkmLogger) {
    this.logger = logger
  }

  hasProvider = (name: ResolverName): boolean => this.providers.has(name)

  initResolver = async (
    ctx: CommandContext,
    stackPath: StackPath,
    parameterName: StackParameterKey,
    name: ResolverName,
    props: ParameterConfig,
  ): Promise<Resolver> => {
    if (props.confidential) {
      this.logger.debug(
        `Init resolver '${name}' for stack: '${stackPath}', parameter: '${parameterName}' with properties: *****`,
      )
    } else {
      this.logger.debugObject(
        `Init resolver '${name}' for stack: '${stackPath}', parameter: '${parameterName}' with properties:`,
        () => props,
      )
    }

    const provider = this.getProvider(name)
    if (provider.schema) {
      const schema = provider.schema({
        ctx,
        joi: Joi.defaults((schema) => schema),
        base: defaultSchema(name),
      })

      if (!Joi.isSchema(schema)) {
        throw new TakomoError(
          `Error in parameter '${parameterName}' of stack ${stackPath}:\n\n` +
            `  - value returned from resolver schema function is not a Joi schema object`,
        )
      }

      const { error } = schema.validate(props, {
        abortEarly: false,
        convert: false,
      })
      if (error) {
        const details = error.details.map((d) => `  - ${d.message}`).join("\n")
        throw new TakomoError(
          `${error.details.length} validation error(s) in parameter '${parameterName}' of stack ${stackPath}:\n\n${details}`,
        )
      }
    }

    return provider.init(props)
  }

  registerProviderFromFile = async (
    pathToResolverFile: string,
  ): Promise<void> => {
    const providerFile = await import(pathToResolverFile)

    if (!providerFile.default) {
      throw new Error(`File ${pathToResolverFile} doesn't have default export`)
    }

    return this.registerProvider(
      providerFile.default,
      `file: ${pathToResolverFile}`,
    )
  }

  registerBuiltInProvider = async (
    provider: ResolverProvider,
  ): Promise<void> => {
    return this.registerProvider(provider, "built-in providers")
  }

  registerProviderFromSource = async (
    provider: ResolverProvider,
    source: string,
  ): Promise<void> => {
    return this.registerProvider(provider, source)
  }

  registerProviderFromNpmPackage = async (
    config: ExternalResolverConfig,
  ): Promise<void> => {
    // eslint-disable-next-line
    const provider = await import(config.package)
    const providerWithName = config.name
      ? { ...provider.default, name: config.name }
      : provider.default

    this.registerProvider(providerWithName, `npm package: ${config.package}`)
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

export const coreResolverProviders = (): ReadonlyArray<ResolverProvider> => [
  createCmdResolverProvider(),
  createExternalStackOutputResolverProvider(),
  createStackOutputResolverProvider(),
  createStaticResolverProvider(),
  createFileContentsResolverProvider(),
  createHookOutputResolverProvider(),
  createSsmResolverProvider(),
  createSecretResolverProvider(),
]
