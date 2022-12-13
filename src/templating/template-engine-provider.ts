import { FilePath } from "../utils/files"
import { TkmLogger } from "../utils/logging"
import { TemplateEngine } from "./template-engine"

export interface TemplateEngineProps {
  readonly projectDir: FilePath
  readonly logger: TkmLogger
}

export interface TemplateEngineProvider {
  /**
   * Initialize a template engine.
   */
  readonly init: (props: TemplateEngineProps) => Promise<TemplateEngine>
}
