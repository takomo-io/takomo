/**
 * Handlebars helper provider
 */
import { FilePath } from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import { HandlebarsHelper } from "./handlebars-helper.js"

export interface InitHandlebarsHelperProps {
  /**
   * Current project directory.
   */
  readonly projectDir: FilePath
  /**
   * Logger instance.
   */
  readonly logger: TkmLogger
}

export interface HandlebarsHelperProvider {
  /**
   * Initialize a Handlebars helper
   */
  readonly init: (props: InitHandlebarsHelperProps) => Promise<HandlebarsHelper>
}
