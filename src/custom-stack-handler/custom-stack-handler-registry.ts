import { TkmLogger } from "../utils/logging.js"
import { CustomStackHandler, CustomStackState } from "./custom-stack-handler.js"
import { createCmdCustomStackHandler } from "./cmd-custom-stack-handler.js"
import { CustomStackType } from "../stacks/stack.js"

export interface CustomStackHandlerRegistry {
  readonly getHandler: (type: CustomStackType) => CustomStackHandler<any, any>

  readonly registerHandler: (
    provider: CustomStackHandler<any, any>,
  ) => Promise<void>
}

interface CreateCustomStackHandlerRegistryProps {
  readonly logger: TkmLogger
}

export const createCustomStackHandlerRegistry = ({
  logger,
}: CreateCustomStackHandlerRegistryProps): CustomStackHandlerRegistry => {
  const handlers = new Map<
    CustomStackType,
    CustomStackHandler<unknown, CustomStackState>
  >()

  const registerHandler = async (
    handler: CustomStackHandler<unknown, CustomStackState>,
  ): Promise<void> => {
    if (handler.type === "standard") {
      throw new Error(
        `Cannot register custom stack handler with reserved type 'standard'`,
      )
    }

    const existingHandler = handlers.get(handler.type)
    if (existingHandler) {
      throw new Error(
        `Custom stack handler already registered for with type '${handler.type}'`,
      )
    }

    logger.debug(`Registered custom stack handler with type '${handler.type}'`)

    handlers.set(handler.type, handler)
  }

  const getHandler = (
    type: CustomStackType,
  ): CustomStackHandler<unknown, CustomStackState> => {
    const handler = handlers.get(type)
    if (!handler) {
      throw new Error(`Custom stack handler not found with type '${type}'`)
    }

    return handler
  }

  return {
    registerHandler,
    getHandler,
  }
}

export const coreCustomStackHandlerProviders = (): ReadonlyArray<
  CustomStackHandler<any, any>
> => [createCmdCustomStackHandler()]
