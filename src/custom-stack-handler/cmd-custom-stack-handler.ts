import {
  CustomStackHandlerProvider,
  CustomStackHandlerProviderSchemaProps,
} from "./custom-stack-handler-provider.js"

type CmdCustomStackHandlerConfig = {}
type CmdCustomStackHandlerState = {}
type CmdCustomStackHandlerProvider = CustomStackHandlerProvider<
  CmdCustomStackHandlerConfig,
  CmdCustomStackHandlerState
>

export const createCmdCustomStackHandlerProvider =
  (): CmdCustomStackHandlerProvider => {
    return {
      type: "cmd",

      schema: (props: CustomStackHandlerProviderSchemaProps) =>
        props.joi.object({}),

      init: async () => {
        return {
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
      },
    }
  }
