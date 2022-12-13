import { InternalTakomoProjectConfig } from "../../config/project-config"
import { TakomoError } from "../../utils/errors"
import { dirExists, FilePath } from "../../utils/files"
import { TkmLogger } from "../../utils/logging"
import { TemplateEngine } from "../template-engine"
import {
  TemplateEngineProps,
  TemplateEngineProvider,
} from "../template-engine-provider"
import { HandlebarsTemplateEngine } from "./handlebars-template-engine"
import { loadHandlebarsHelpers } from "./load-handlebars-helpers"
import { loadHandlebarsPartials } from "./load-handlebars-partials"

interface HandlebarsTemplateEngineProviderProps {
  readonly partialsDir: FilePath
  readonly helpersDir: FilePath
  readonly projectConfig: InternalTakomoProjectConfig
  readonly logger: TkmLogger
}

export class HandlebarsTemplateEngineProvider
  implements TemplateEngineProvider
{
  readonly #partialsDir: FilePath
  readonly #helpersDir: FilePath
  readonly #projectConfig: InternalTakomoProjectConfig
  readonly #logger: TkmLogger

  constructor(props: HandlebarsTemplateEngineProviderProps) {
    this.#partialsDir = props.partialsDir
    this.#helpersDir = props.helpersDir
    this.#projectConfig = props.projectConfig
    this.#logger = props.logger
  }

  async init({
    projectDir,
    logger,
  }: TemplateEngineProps): Promise<TemplateEngine> {
    const te = new HandlebarsTemplateEngine({ projectDir, logger })

    this.#projectConfig.helpers.forEach((config) => {
      this.#logger.debug(
        `Register Handlebars helper from NPM package: ${config.package}`,
      )
      // eslint-disable-next-line
      const helper = require(config.package)
      const helperWithName = config.name
        ? { ...helper, name: config.name }
        : helper

      if (typeof helperWithName.fn !== "function") {
        throw new TakomoError(
          `Handlebars helper loaded from an NPM package ${config.package} does not export property 'fn' of type function`,
        )
      }

      if (typeof helperWithName.name !== "string") {
        throw new TakomoError(
          `Handlebars helper loaded from an NPM package ${config.package} does not export property 'name' of type string`,
        )
      }

      te.registerHelper(helperWithName.name, helperWithName.fn)
    })

    const defaultHelpersDirExists = await dirExists(this.#helpersDir)
    const additionalHelpersDirs = this.#projectConfig.helpersDir

    const helpersDirs = defaultHelpersDirExists
      ? [this.#helpersDir, ...additionalHelpersDirs]
      : additionalHelpersDirs

    const defaultPartialsDirExists = await dirExists(this.#partialsDir)
    const additionalPartialsDirs = this.#projectConfig.partialsDir

    const partialsDirs = defaultPartialsDirExists
      ? [this.#partialsDir, ...additionalPartialsDirs]
      : additionalPartialsDirs

    await Promise.all([
      loadHandlebarsHelpers(helpersDirs, this.#logger, te),
      loadHandlebarsPartials(partialsDirs, this.#logger, te),
    ])

    return te
  }
}
