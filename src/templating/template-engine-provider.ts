import { FilePath } from "../utils/files.js"
import { TkmLogger } from "../utils/logging.js"
import { TemplateEngine } from "./template-engine.js"

export interface TemplateEngineProps {
  /**
   * Current project directory.
   */
  readonly projectDir: FilePath
  /**
   * Logger instance.
   */
  readonly logger: TkmLogger

  /**
   * Whether confidential values may be included in logs.
   */
  readonly confidentialValuesLoggingEnabled?: boolean
}

export interface TemplateEngineProvider {
  /**
   * Initialize a template engine.
   */
  readonly init: (props: TemplateEngineProps) => Promise<TemplateEngine>
}
