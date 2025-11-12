import { HookProvider } from "../hooks/hook-provider.js"
import { ResolverProvider } from "../resolvers/resolver-provider.js"
import { CustomStackHandlerProvider } from "../custom-stack-handler/custom-stack-handler-provider.js"
import { SchemaProvider } from "../takomo-stacks-model/schemas.js"
import { TemplateEngineProvider } from "../templating/template-engine-provider.js"
import { FilePath } from "../utils/files.js"

/**
 * Takomo custom configuration.
 */
export interface TakomoConfig {
  /**
   * List of custom stack handler providers.
   */
  readonly customStackHandlers?: Array<CustomStackHandlerProvider<any, any>>

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

  /**
   * Template engine provider.
   */
  readonly templateEngineProvider?: TemplateEngineProvider
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
