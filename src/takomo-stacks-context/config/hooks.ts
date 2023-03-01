import { ChecksumHook } from "../../hooks/checksum-hook.js"
import { CmdHook } from "../../hooks/cmd-hook.js"
import { HookExecutor } from "../../hooks/hook-executor.js"
import { HookProvider } from "../../hooks/hook-provider.js"
import { HookRegistry } from "../../hooks/hook-registry.js"
import { HookConfig } from "../../hooks/hook.js"

export const coreHookProviders = (): ReadonlyArray<HookProvider> => [
  {
    type: "cmd",
    init: (props: any) => Promise.resolve(new CmdHook(props)),
  },
  {
    type: "checksum",
    init: (props: any) => Promise.resolve(new ChecksumHook(props)),
  },
]

export const initializeHooks = async (
  hookConfigs: ReadonlyArray<HookConfig>,
  hookRegistry: HookRegistry,
): Promise<ReadonlyArray<HookExecutor>> =>
  Promise.all(
    hookConfigs.map(async (config) => {
      const hook = await hookRegistry.initHook(config)
      return new HookExecutor(config, hook)
    }),
  )
