import { TakomoError } from "@takomo/util"
import { CmdHook } from "../../hook/impl"
import { HookConfig, HookExecutor, HookInitializersMap } from "../../hook/model"

export const coreHookInitializers = (): HookInitializersMap =>
  new Map([["cmd", (props: any) => Promise.resolve(new CmdHook(props))]])

export const initializeHooks = async (
  hookConfigs: HookConfig[],
  hookInitializers: HookInitializersMap,
): Promise<HookExecutor[]> => {
  return Promise.all(
    hookConfigs.map(async (config) => {
      const initializer = hookInitializers.get(config.type)
      if (!initializer) {
        throw new TakomoError(`Unknown hook type: ${config.type}`)
      }

      const hook = await initializer(config)
      return new HookExecutor(config, hook)
    }),
  )
}
