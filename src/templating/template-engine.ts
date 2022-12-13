import { FilePath } from "../utils/files"

export interface RenderTemplateProps {
  /**
   * A template string
   */
  readonly templateString: string
  /**
   * Variables used to render the template string
   */
  readonly variables: unknown
}

export interface RenderTemplateFileProps {
  /**
   * Path to file containing a template string
   */
  readonly pathToFile: FilePath
  /**
   * Variables used to render the template string
   */
  readonly variables: unknown
}

/**
 * Template engine to process configuration files.
 */
export interface TemplateEngine {
  /**
   * Render template from a string.
   */
  readonly renderTemplate: (props: RenderTemplateProps) => Promise<string>

  /**
   * Render template from a file.
   */
  readonly renderTemplateFile: (
    props: RenderTemplateFileProps,
  ) => Promise<string>
}
