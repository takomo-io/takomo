/**
 * Handlebars helper provider
 */
import { FilePath } from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import { HandlebarsHelper } from "./handlebars-helper.js"
import {
  HandlebarsCompileOptions,
  HandlebarsSafeString,
  HandlebarsTemplateDelegate,
} from "./handlebars-template-engine.js"

export interface InitHandlebarsHelperProps {
  /**
   * Current project directory.
   */
  readonly projectDir: FilePath
  /**
   * Logger instance.
   */
  readonly logger: TkmLogger

  /**
   * Compile template string
   */
  readonly compile: (
    templateString: string,
    options?: HandlebarsCompileOptions,
  ) => HandlebarsTemplateDelegate

  /**
   * Create Handlebars SafeString instance. Handlebars will not perform
   * html escape for SafeStrings.
   */
  readonly safeString: (str: string) => HandlebarsSafeString
}

/**
 * Allows more customization to helper.
 */
export interface HandlebarsHelperProvider {
  /**
   * Initialize a Handlebars helper
   */
  readonly init: (props: InitHandlebarsHelperProps) => Promise<HandlebarsHelper>
}
