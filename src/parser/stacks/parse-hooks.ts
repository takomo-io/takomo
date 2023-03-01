import { HookConfig } from "../../hooks/hook.js"

export const parseHooks = (value: unknown): ReadonlyArray<HookConfig> => {
  if (!value) {
    return []
  }

  return value as ReadonlyArray<HookConfig>
}
