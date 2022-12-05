import { TakomoError, TakomoErrorProps } from "../utils/errors"
import { FilePath } from "../utils/files"
import { TkmLogger } from "../utils/logging"
import { Hook, HookConfig, HookType } from "./hook"
import { HookProvider } from "./hook-provider"

class InvalidHookProviderConfigurationError extends TakomoError {
  constructor(
    sourceDescription: string,
    details: string,
    options?: TakomoErrorProps,
  ) {
    super(
      `Invalid hook provider configuration in ${sourceDescription}:\n\n${details}`,
      options,
    )
  }
}

export interface HookRegistry {
  readonly initHook: (props: HookConfig) => Promise<Hook>
  readonly hasProvider: (type: HookType) => boolean
  readonly registerBuiltInProvider: (provider: HookProvider) => Promise<void>
  readonly registerProviderFromSource: (provider: HookProvider) => Promise<void>
  readonly registerProviderFromFile: (
    pathToResolverFile: FilePath,
  ) => Promise<void>
}

interface CreateHookRegistryProps {
  readonly logger: TkmLogger
}

export const createHookRegistry = ({
  logger,
}: CreateHookRegistryProps): HookRegistry => {
  const providers = new Map<HookType, HookProvider>()

  const hasProvider = (type: HookType): boolean => providers.has(type)

  const registerProvider = async (
    provider: any,
    sourceDescription: string,
  ): Promise<void> => {
    logger.debug(`Register hook provider from ${sourceDescription}`)

    if (provider.type === undefined || provider.type === null) {
      throw new InvalidHookProviderConfigurationError(
        sourceDescription,
        "type property not defined",
        {
          info:
            "type property defines the type for the hook. " +
            "It must be a string",
        },
      )
    }

    if (provider.init === undefined || provider.init === null) {
      throw new InvalidHookProviderConfigurationError(
        sourceDescription,
        "init function not defined",
      )
    }

    if (typeof provider.init !== "function") {
      throw new InvalidHookProviderConfigurationError(
        sourceDescription,
        "init is not a function",
      )
    }

    if (typeof provider.type !== "string") {
      throw new InvalidHookProviderConfigurationError(
        sourceDescription,
        "type property has invalid type",
        {
          info:
            "type property defines the type for the hook. " +
            "It must be a string",
        },
      )
    }

    if (hasProvider(provider.type)) {
      throw new InvalidHookProviderConfigurationError(
        sourceDescription,
        `Hook provider already registered with type '${provider.type}'`,
      )
    }

    logger.debug(
      `Registered hook provider from ${sourceDescription} with type '${provider.type}'`,
    )

    providers.set(provider.type, provider)
  }

  const getProvider = (type: HookType): HookProvider => {
    const provider = providers.get(type)
    if (!provider) {
      throw new Error(`No provider found for hook with type '${type}'`)
    }

    return provider
  }

  const initHook = async (props: HookConfig): Promise<Hook> => {
    const provider = getProvider(props.type)
    return provider.init(props)
  }

  const registerBuiltInProvider = (provider: HookProvider): Promise<void> =>
    registerProvider(provider, "built-in providers")

  const registerProviderFromSource = (provider: HookProvider): Promise<void> =>
    registerProvider(provider, "source providers")

  const registerProviderFromFile = async (
    pathToFile: FilePath,
  ): Promise<void> => {
    // eslint-disable-next-line
    const provider = require(pathToFile)
    return registerProvider(provider, `file: ${pathToFile}`)
  }

  return {
    registerBuiltInProvider,
    registerProviderFromFile,
    registerProviderFromSource,
    initHook,
    hasProvider,
  }
}
