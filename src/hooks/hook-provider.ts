import { Hook, HookConfig, HookType } from "./hook.js"

/**
 * An interface to be implemented by objects that initialize {@linkcode Hook}
 * objects.
 */
export interface HookProvider {
  /**
   * The name of the hook that this provider initializes.
   */
  readonly type: HookType

  /**
   * Initialize a hook.
   */
  readonly init: (props: HookConfig) => Promise<Hook>
}
