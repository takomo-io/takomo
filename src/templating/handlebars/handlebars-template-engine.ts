import hb from "handlebars"
import { TakomoError } from "../../utils/errors.js"
import {
  expandFilePath,
  fileExists,
  FilePath,
  readFileContents,
} from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import { buildErrorMessage } from "../../utils/templating.js"
import {
  RenderTemplateFileProps,
  RenderTemplateProps,
  TemplateEngine,
} from "../template-engine.js"

export class PartialAlreadyRegisteredError extends TakomoError {
  constructor(
    name: string,
    pathToPartialFile: FilePath,
    pathToExistingPartialFile: FilePath,
  ) {
    const message = `Partial with name '${name}' already registered from ${pathToExistingPartialFile}`
    super(message, {
      info: `Could not register partial ${name} from ${pathToPartialFile} because a partial with the same name is already registered`,
      instructions: ["Use another name to register your partial"],
    })
  }
}

interface HandlebarsTemplateEngineProps {
  readonly projectDir: FilePath
  readonly logger: TkmLogger
}

export class HandlebarsTemplateEngine implements TemplateEngine {
  readonly #instance = hb.create()
  readonly #registeredPartials = new Map<string, string>()
  readonly #projectDir: FilePath
  readonly #logger: TkmLogger

  constructor({ logger, projectDir }: HandlebarsTemplateEngineProps) {
    this.#projectDir = projectDir
    this.#logger = logger
  }

  registerHelper(name: string, fn: any): void {
    this.#instance.registerHelper(name, fn)
  }

  async registerPartial(name: string, pathToFile: FilePath): Promise<void> {
    const absolutePath = expandFilePath(this.#projectDir, pathToFile)
    this.#logger.debug(`Register partial '${name}' from file ${absolutePath}`)

    const existingPathToFile = this.#registeredPartials.get(name)
    if (existingPathToFile) {
      throw new PartialAlreadyRegisteredError(
        name,
        absolutePath,
        existingPathToFile,
      )
    }

    const partialString = await readFileContents(absolutePath)
    this.#registeredPartials.set(name, absolutePath)

    const partial = this.#instance.compile(partialString)
    this.#instance.registerPartial(name, partial)
  }

  async renderTemplate({
    templateString,
    variables,
    sourceDescription,
  }: RenderTemplateProps): Promise<string> {
    this.#logger.trace(`Render template from ${sourceDescription}`)

    const template = this.#instance.compile(templateString, {
      noEscape: true,
      strict: true,
    })

    this.#logger.traceText(
      "Template body before rendering:",
      () => templateString,
    )

    this.#logger.traceObject("Render template with variables:", () => variables)

    try {
      const renderedTemplate = template(variables)
      this.#logger.traceText(
        "Template body after rendering:",
        () => renderedTemplate,
      )

      return renderedTemplate
    } catch (e: any) {
      this.#logger.error(
        `An error occurred while rendering template from ${sourceDescription}`,
        e,
      )
      const errorMessage = buildErrorMessage(
        `An error occurred while rendering template from ${sourceDescription}`,
        templateString,
        e,
      )

      throw new TakomoError(errorMessage)
    }
  }

  async renderTemplateFile({
    pathToFile,
    variables,
  }: RenderTemplateFileProps): Promise<string> {
    const absolutePath = expandFilePath(this.#projectDir, pathToFile)
    this.#logger.trace(`Render template from file ${absolutePath}`)

    if (!(await fileExists(absolutePath))) {
      throw new TakomoError(
        `Could not render template from file ${absolutePath} because the file doesn't exist`,
      )
    }

    const templateString = await readFileContents(absolutePath)

    return this.renderTemplate({
      templateString,
      variables,
      sourceDescription: `file ${pathToFile}`,
    })
  }
}
