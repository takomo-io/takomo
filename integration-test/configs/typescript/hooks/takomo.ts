import {
  Hook,
  HookConfig,
  HookOutput,
  HookProvider,
  TakomoConfig,
  TakomoConfigProvider,
} from "../../../../dist"

const exampleHookProvider: HookProvider = {
  init: async (props: HookConfig): Promise<Hook> => {
    return {
      execute: async (input): Promise<HookOutput> => {
        return {
          value: "example-value",
          success: true,
        }
      },
    }
  },

  type: "example",
}

const provider: TakomoConfigProvider = async (): Promise<TakomoConfig> => {
  return {
    hookProviders: [exampleHookProvider],
  }
}

export default provider
