import { CustomStackHandler } from "./custom-stack-handler.js"

type CmdCustomStackHandlerConfig = {}
type CmdCustomStackHandlerState = {}

export const createCmdCustomStackHandler = (): CustomStackHandler<
  CmdCustomStackHandlerConfig,
  CmdCustomStackHandlerState
> => {
  return {
    type: "cmd",

    parseConfig: (props) => {
      throw new Error("Function not implemented.")
    },

    getCurrentState: async () => {
      return {
        state: undefined,
      }
    },

    create: async () => {
      return {
        outputs: {},
      }
    },

    update: async () => {
      return {
        state: {},
        outputs: {},
      }
    },

    delete: async () => {
      return {
        success: true,
      }
    },
  }
}
