import { ChecksumHook, CmdHook, HookRegistry } from "@takomo/stacks-hooks"
import { HookConfig, HookExecutor, HookProvider } from "@takomo/stacks-model"

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
