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

    getCurrentState: async (props) => {
      return {
        success: true,
        state: {},
      }
    },

    create: async (props) => {
      return {
        success: true,
        state: {},
      }
    },

    update: async (props) => {
      return {
        success: true,
        state: {},
      }
    },

    delete: async (props) => {
      return {
        success: true,
      }
    },
  }
}
