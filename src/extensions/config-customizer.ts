import { HookProvider } from "../hooks/hook-provider"
import { ResolverProvider } from "../resolvers/resolver-provider"
import { FilePath } from "../utils/files"

export interface TakomoConfig {
  readonly hookProviders?: Array<HookProvider>
  readonly resolverProviders?: Array<ResolverProvider>
}

export interface TakomoConfigProps {
  readonly projectDir: FilePath
}

export type TakomoConfigProvider = (
  props: TakomoConfigProps,
) => Promise<TakomoConfig>
