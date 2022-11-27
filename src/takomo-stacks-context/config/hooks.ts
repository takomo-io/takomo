import { ChecksumHook } from "../../hooks/checksum-hook"
import { CmdHook } from "../../hooks/cmd-hook"
import { HookConfig } from "../../hooks/hook"
import { HookExecutor } from "../../hooks/hook-executor"
import { HookProvider } from "../../hooks/hook-provider"
import { HookRegistry } from "../../hooks/hook-registry"

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
