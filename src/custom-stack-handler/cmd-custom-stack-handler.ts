import { CustomStackHandler, CustomStackState } from "./custom-stack-handler.js"

type CmdCustomStackHandlerConfig = {}
type CmdCustomStackHandlerState = {} & CustomStackState

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
        status: "PENDING",
        state: {
          status: "PENDING",
        },
      }
    },

    create: async (props) => {
      return {
        success: true,
        state: {
          status: "CREATE_COMPLETED",
        },
      }
    },

    update: async (props) => {
      return {
        success: true,
        state: {
          status: "UPDATE_COMPLETED",
        },
      }
    },

    delete: async (props) => {
      return {
        success: true,
      }
    },
  }
}
