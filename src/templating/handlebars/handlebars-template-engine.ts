import hb from "handlebars"
import { TakomoError } from "../../utils/errors"
import {
  expandFilePath,
  fileExists,
  FilePath,
  readFileContents,
} from "../../utils/files"
import { TkmLogger } from "../../utils/logging"
import { buildErrorMessage } from "../../utils/templating"
import {
  RenderTemplateFileProps,
  RenderTemplateProps,
  TemplateEngine,
} from "../template-engine"

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

  // TODO: Add error handling (like done in utils.js/renderTemplate)
  async renderTemplate({
    templateString,
    variables,
  }: RenderTemplateProps): Promise<string> {
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
      const errorMessage = buildErrorMessage(
        `An error occurred while rendering template`,
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

    try {
      return this.renderTemplate({
        templateString,
        variables,
      })
    } catch (e) {
      this.#logger.error(
        `An error occurred while rendering template from file ${pathToFile}`,
      )

      throw e
    }
  }
}
