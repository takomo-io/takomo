import Ejs from "ejs"
import { FilePath, readFileContents } from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import {
  RenderTemplateFileProps,
  RenderTemplateProps,
  TemplateEngine,
} from "../template-engine.js"

interface EjsTemplateEngineProps {
  readonly projectDir: FilePath
  readonly logger: TkmLogger
}

export class EjsTemplateEngine implements TemplateEngine {
  readonly #logger: TkmLogger
  readonly #projectDir: FilePath

  constructor({ projectDir, logger }: EjsTemplateEngineProps) {
    this.#logger = logger
    this.#projectDir = projectDir
  }

  async renderTemplate({
    templateString,
    variables,
  }: RenderTemplateProps): Promise<string> {
    this.#logger.traceText(
      "Template body before rendering:",
      () => templateString,
    )

    this.#logger.traceObject("Render template with variables:", () => variables)

    try {
      const renderedTemplate = Ejs.render(
        templateString,
        { it: variables },
        {
          rmWhitespace: false,
          views: [this.#projectDir],
        },
      )
      this.#logger.traceText(
        "Template body after rendering:",
        () => renderedTemplate,
      )

      return renderedTemplate
    } catch (e) {
      this.#logger.error("An error occurred while rendering template")
      throw e
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
