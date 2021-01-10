import { HookConfig } from "./model"

export const parseHooks = (value: unknown): ReadonlyArray<HookConfig> => {
  if (!value) {
    return []
  }

  return value as ReadonlyArray<HookConfig>
}
