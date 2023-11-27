import { expandFilePath, FilePath } from "../../utils/files.js"
import {
  TemplateEngineProps,
  TemplateEngineProvider,
} from "../template-engine-provider.js"
import { TemplateEngine } from "../template-engine.js"
import { HandlebarsHelperProvider } from "./handlebars-helper-provider.js"
import { HandlebarsHelper } from "./handlebars-helper.js"
import { HandlebarsTemplateEngine } from "./handlebars-template-engine.js"
import { loadHandlebarsHelpers } from "./load-handlebars-helpers.js"
import { loadHandlebarsPartials } from "./load-handlebars-partials.js"

export interface HandlebarsTemplateEngineProviderProps {
  /**
   * List of file paths to directories from where to load Handlebars partial files.
   * The file paths can be absolute or relative to the current project dir.
   * Non-existing file paths are ignored.
   */
  readonly partialsDirs?: ReadonlyArray<FilePath>
  /**
   * List of file paths to directories from where to load Handlebars helpers
   * implemented with plain JavaScript. The file paths can be absolute or relative
   * to the current project dir. Non-existing file paths are ignored.
   */
  readonly helpersDirs?: ReadonlyArray<FilePath>
  /**
   * List of helpers.
   */
  readonly helpers?: ReadonlyArray<HandlebarsHelper>
  /**
   * List of helper providers.
   */
  readonly helperProviders?: ReadonlyArray<HandlebarsHelperProvider>
}

/**
 * Handlebars template engine provider.
 */
export class HandlebarsTemplateEngineProvider
  implements TemplateEngineProvider
{
  readonly #partialsDirs: ReadonlyArray<FilePath>
  readonly #helpersDirs: ReadonlyArray<FilePath>
  readonly #helpers: ReadonlyArray<HandlebarsHelper>
  readonly #helperProviders: ReadonlyArray<HandlebarsHelperProvider>

  constructor(props: HandlebarsTemplateEngineProviderProps = {}) {
    this.#partialsDirs = props.partialsDirs ?? []
    this.#helpersDirs = props.helpersDirs ?? []
    this.#helpers = props.helpers ?? []
    this.#helperProviders = props.helperProviders ?? []
  }

  async init({
    projectDir,
    logger,
  }: TemplateEngineProps): Promise<TemplateEngine> {
    const te = new HandlebarsTemplateEngine({ projectDir, logger })

    const helpersDirs = this.#helpersDirs.map((dir) =>
      expandFilePath(projectDir, dir),
    )

    const partialsDirs = this.#partialsDirs.map((dir) =>
      expandFilePath(projectDir, dir),
    )

    await Promise.all([
      loadHandlebarsHelpers(helpersDirs, logger, te),
      loadHandlebarsPartials(partialsDirs, logger, te),
    ])

    this.#helpers.forEach((helper) => {
      te.registerHelper(helper.name, helper.fn)
    })

    const helpers = await Promise.all(
      this.#helperProviders.map((provider) =>
        provider.init({ projectDir, logger }),
      ),
    )

    helpers.forEach((helper) => {
      te.registerHelper(helper.name, helper.fn)
    })

    return te
  }
}
