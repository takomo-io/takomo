import { HookProvider } from "../hooks/hook-provider"
import { FilePath } from "../utils/files"

export interface TakomoConfig {
  readonly hookProviders?: Array<HookProvider>
}

export interface TakomoConfigProps {
  readonly projectDir: FilePath
}

export type TakomoConfigProvider = (
  props: TakomoConfigProps,
) => Promise<TakomoConfig>
