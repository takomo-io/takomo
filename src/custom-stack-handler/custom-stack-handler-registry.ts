import { TakomoError } from "../utils/errors.js"
import { TkmLogger } from "../utils/logging.js"
import { CustomStackHandlerProvider } from "./custom-stack-handler-provider.js"
import { CustomStackHandler } from "./custom-stack-handler.js"
import { CustomStackType } from "../stacks/custom-stack.js"
import { createCmdCustomStackHandlerProvider } from "./cmd-custom-stack-handler.js"

export interface CustomStackHandlerRegistry {
  readonly initHandler: (
    type: CustomStackType,
    props: unknown,
  ) => Promise<CustomStackHandler<any, any>>
  readonly hasProvider: (type: CustomStackType) => boolean
  readonly registerProvider: (
    provider: CustomStackHandlerProvider<any, any>,
  ) => Promise<void>
}

interface CreateCustomStackHandlerRegistryProps {
  readonly logger: TkmLogger
}

export const createCustomStackHandlerRegistry = ({
  logger,
}: CreateCustomStackHandlerRegistryProps): CustomStackHandlerRegistry => {
  const providers = new Map<
    CustomStackType,
    CustomStackHandlerProvider<any, any>
  >()

  const hasProvider = (type: CustomStackType): boolean => providers.has(type)

  const registerProvider = async (
    provider: CustomStackHandlerProvider<any, any>,
  ): Promise<void> => {
    if (hasProvider(provider.type)) {
      throw new TakomoError(
        `Custom stack handler provider already registered with type '${provider.type}'`,
      )
    }

    logger.debug(
      `Registered custom stack handler provider with type '${provider.type}'`,
    )

    providers.set(provider.type, provider)
  }
  const getProvider = (
    type: CustomStackType,
  ): CustomStackHandlerProvider<any, any> => {
    const provider = providers.get(type)
    if (!provider) {
      throw new Error(`No provider found for custom stack with type '${type}'`)
    }

    return provider
  }

  const initHandler = async (
    type: CustomStackType,
    props: unknown,
  ): Promise<CustomStackHandler<any, any>> => {
    const provider = getProvider(type)
    return provider.init(props)
  }

  return {
    registerProvider,
    initHandler,
    hasProvider,
  }
}

export const coreCustomStackHandlerProviders = (): ReadonlyArray<
  CustomStackHandlerProvider<any, any>
> => [createCmdCustomStackHandlerProvider()]
