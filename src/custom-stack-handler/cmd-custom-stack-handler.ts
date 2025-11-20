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
        success: true,
      }
    },

    create: async () => {
      return {
        success: true,
      }
    },

    update: async () => {
      return {
        success: true,
      }
    },

    delete: async () => {
      return {
        success: true,
      }
    },
  }
}
