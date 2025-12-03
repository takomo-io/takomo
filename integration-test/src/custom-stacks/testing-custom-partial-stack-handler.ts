import { CustomStackHandler, CustomStackState } from "../../../src/index.js"
import {} from "./testing-custom-stack-handler.js"

export type TestingCustomPartialStackHandlerConfig = object
export type TestingCustomPartialStackHandlerState = CustomStackState

/**
 * A custom stack handler that does not implement getChanges and getCurrentState.
 * Used to test the default behaviors when these methods are not implemented.
 */
export const testingCustomPartialStackHandler: CustomStackHandler<
  TestingCustomPartialStackHandlerConfig,
  TestingCustomPartialStackHandlerState
> = {
  type: "testing-custom-partial-stack",
  parseConfig: async ({ logger }) => {
    logger.info("Parsing config for testing-custom-partial-stack")
    return {
      success: true,
      parsedConfig: {},
    }
  },
  create: async ({ logger }) => {
    logger.info("Creating stack for testing-custom-partial-stack")
    return {
      success: true,
      createdState: {
        status: "CREATE_COMPLETE",
      },
    }
  },
  update: async () => {
    throw new Error("Function not implemented.")
  },
  delete: async ({ logger }) => {
    logger.info("Deleting stack for testing-custom-partial-stack")
    return {
      success: true,
    }
  },
}
