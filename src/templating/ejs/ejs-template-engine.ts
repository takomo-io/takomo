import Ejs from "ejs"
import { TakomoError } from "../../utils/errors.js"
import { FilePath, readFileContents } from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import {
  REDACTED_VALUE,
  redactConfidentialValue,
} from "../../utils/confidential.js"
import {
  RenderTemplateFileProps,
  RenderTemplateProps,
  TemplateEngine,
} from "../template-engine.js"

interface EjsTemplateEngineProps {
  readonly projectDir: FilePath
  readonly logger: TkmLogger
  readonly confidentialValuesLoggingEnabled?: boolean
}

export class EjsTemplateEngine implements TemplateEngine {
  readonly #logger: TkmLogger
  readonly #projectDir: FilePath
  readonly #confidentialValuesLoggingEnabled: boolean

  constructor({
    projectDir,
    logger,
    confidentialValuesLoggingEnabled = false,
  }: EjsTemplateEngineProps) {
    this.#logger = logger
    this.#projectDir = projectDir
    this.#confidentialValuesLoggingEnabled = confidentialValuesLoggingEnabled
  }

  async renderTemplate({
    templateString,
    variables,
  }: RenderTemplateProps): Promise<string> {
    this.#logger.traceText("Template body before rendering:", () =>
      redactConfidentialValue(
        templateString,
        true,
        this.#confidentialValuesLoggingEnabled,
      ),
    )

    this.#logger.traceObject("Render template with variables:", () =>
      redactConfidentialValue(
        variables,
        true,
        this.#confidentialValuesLoggingEnabled,
      ),
    )

    try {
      const renderedTemplate = Ejs.render(
        templateString,
        { it: variables },
        {
          rmWhitespace: false,
          views: [this.#projectDir],
        },
      )
      this.#logger.traceText("Template body after rendering:", () =>
        redactConfidentialValue(
          renderedTemplate,
          true,
          this.#confidentialValuesLoggingEnabled,
        ),
      )

      return renderedTemplate
    } catch (e) {
      const message = "An error occurred while rendering template"
      this.#logger.error(message)
      if (this.#confidentialValuesLoggingEnabled) {
        throw e
      }
      throw new TakomoError(`${message}: ${REDACTED_VALUE}`)
    }
  }

  async renderTemplateFile({
    pathToFile,
    variables,
  }: RenderTemplateFileProps): Promise<string> {
    const templateString = await readFileContents(pathToFile)
    return this.renderTemplate({
      templateString,
      variables,
      sourceDescription: `file ${pathToFile}`,
    })
  }
}
