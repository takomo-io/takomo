import { HookProvider } from "../hooks/hook-provider"
import { ResolverProvider } from "../resolvers/resolver-provider"
import { SchemaProvider } from "../takomo-stacks-model/schemas"
import { FilePath } from "../utils/files"

/**
 * Takomo custom configuration.
 */
export interface TakomoConfig {
  /**
   * List of hook providers.
   */
  readonly hookProviders?: Array<HookProvider>

  /**
   * List of resolver providers.
   */
  readonly resolverProviders?: Array<ResolverProvider>

  /**
   * List of schema providers.
   */
  readonly schemaProviders?: Array<SchemaProvider>
}

/**
 * Arguments for {TakomoConfigProvider} function.
 */
export interface TakomoConfigProps {
  /**
   * Current project dir.
   */
  readonly projectDir: FilePath
}

/**
 * Function that creates Takomo custom configuration object.
 */
export type TakomoConfigProvider = (
  props: TakomoConfigProps,
) => Promise<TakomoConfig>
