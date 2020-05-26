import hb from "handlebars"
import { TakomoError } from "../errors"
import { buildErrorMessage } from "./internal"

/**
 * Template engine.
 */
export class TemplateEngine {
  private instance: any

  constructor() {
    this.instance = hb.create()
  }

  /**
   * Register a Handlebars helper.
   *
   * @param name Helper name
   * @param fn Helper function
   */
  registerHelper = (name: string, fn: any): void => {
    this.instance.registerHelper(name, fn)
  }

  /**
   * Register a Handlebars partial.
   *
   * @param name Partial name
   * @param partialString Partial string
   */
  registerPartial = (name: string, partialString: string): void => {
    const partial = this.instance.compile(partialString)
    this.instance.registerPartial(name, partial)
  }

  /**
   * Renders a template with variables.
   *
   * @param string Template string
   * @param variables Variables
   * @returns Rendered template
   */
  renderTemplate = (string: string, variables: any): string => {
    const template = this.instance.compile(string, {
      noEscape: false,
      strict: true,
    })

    return template(variables)
  }
}

export const renderTemplate = async (
  templateEngine: TemplateEngine,
  filePath: string,
  contents: string,
  variables: any,
): Promise<string> => {
  try {
    return templateEngine.renderTemplate(contents, variables)
  } catch (e) {
    const errorMessage = buildErrorMessage(filePath, contents, e)
    throw new TakomoError(errorMessage)
  }
}
