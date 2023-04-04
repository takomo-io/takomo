/**
 * Handlebars helper
 */
export interface HandlebarsHelper {
  /**
   * Name which to refer to the helper from a Handlebars template.
   */
  readonly name: string
  /**
   * Helper function to be invoked when a Handlebars template is rendered.
   */
  readonly fn: (...args: any) => unknown
}
