import hb from "handlebars"
import { TakomoError } from "./errors"

const linesToIncludeBeforeAndAfter = 3

const calculateFirstLineToInclude = (lineNumber: number): number => {
  const firstLineNumber = lineNumber - linesToIncludeBeforeAndAfter
  return firstLineNumber > 0 ? firstLineNumber : 1
}

const calculateLastLineToInclude = (
  lineNumber: number,
  lineCount: number,
): number => {
  const lastLineNumber = lineNumber + linesToIncludeBeforeAndAfter
  return lastLineNumber > lineCount ? lineCount : lastLineNumber
}

const calculateGutterWidth = (firstLine: number, lastLine: number): number =>
  Math.max(`${firstLine}`.length, `${lastLine}`.length) + 2

const padLines = (
  lines: string[],
  firstLineNumber: number,
  gutterWidth: number,
): string[] =>
  lines.map(
    (line, n) => `${firstLineNumber + n}`.padStart(gutterWidth) + ":  " + line,
  )

const makeMarkerLine = (
  column: number,
  endColumn: number,
  gutterWidth: number,
): string =>
  "^".repeat(endColumn - column + 1).padStart(endColumn + gutterWidth + 3)

const insertMarkerLine = (
  lines: string[],
  firstLineNumber: number,
  lineNumber: number,
  column: number,
  endColumn: number,
  gutterWidth: number,
): void => {
  const markerLine = makeMarkerLine(column, endColumn, gutterWidth)
  lines.splice(lineNumber - firstLineNumber + 1, 0, markerLine)
}

interface ErrorSpec {
  // Inclusive start line
  readonly lineNumber?: number
  // Inclusive end line
  readonly endLineNumber?: number
  // Inclusive start column
  readonly column?: number
  // Inclusive end column
  readonly endColumn?: number
  // Error message
  readonly message?: string
}

export const buildErrorMessage = <E extends Error>(
  description: string,
  contents: string,
  spec: ErrorSpec,
): string => {
  const { lineNumber, endLineNumber, column, endColumn, message } = spec

  if (
    lineNumber === undefined ||
    endLineNumber === undefined ||
    column === undefined ||
    endColumn === undefined
  ) {
    return `${description}\n\n${message}\n`
  }

  if (lineNumber !== endLineNumber) {
    return (
      `${description}\n\n` +
      `message:  ${message}\n` +
      `line:     ${lineNumber}\n` +
      `column:   ${column}`
    )
  }

  const lines = contents.split("\n")
  const lineCount = lines.length
  const firstLineNumber = calculateFirstLineToInclude(lineNumber)
  const lastLineNumber = calculateLastLineToInclude(lineNumber, lineCount)
  const gutterWidth = calculateGutterWidth(firstLineNumber, lastLineNumber)
  const includedLines = lines.slice(firstLineNumber - 1, lastLineNumber)
  const paddedLines = padLines(includedLines, firstLineNumber, gutterWidth)

  insertMarkerLine(
    paddedLines,
    firstLineNumber,
    lineNumber,
    column,
    endColumn,
    gutterWidth,
  )

  return (
    `${description}\n\n` +
    `message:  ${message}\n` +
    `line:     ${lineNumber}\n` +
    `column:   ${column}\n\n` +
    paddedLines.join("\n")
  )
}

/**
 * Template engine to process Handlebars templates.
 */
export interface TemplateEngine {
  readonly registerHelper: (name: string, fn: any) => void
  readonly registerPartial: (
    name: string,
    partialString: string,
    partialSource: string,
  ) => void
  readonly renderTemplate: (string: string, variables: any) => string
}

export class PartialAlreadyRegisteredError extends TakomoError {
  constructor(name: string, source: string, existingSource: string) {
    const message = `Partial with name '${name}' already registered from ${existingSource}`
    super(message, {
      info: `Could not register partial ${name} from source ${source} because a partial with the same name is already registered`,
      instructions: ["Use another name to register your partial"],
    })
  }
}

export const createTemplateEngine = (): TemplateEngine => {
  const instance = hb.create()
  const registeredPartials = new Map<string, string>()

  const registerHelper = (name: string, fn: any): void => {
    instance.registerHelper(name, fn)
  }

  const registerPartial = (
    name: string,
    partialString: string,
    partialSource: string,
  ): void => {
    const existingSource = registeredPartials.get(name)
    if (existingSource) {
      throw new PartialAlreadyRegisteredError(
        name,
        partialSource,
        existingSource,
      )
    }

    registeredPartials.set(name, partialSource)
    const partial = instance.compile(partialString)
    instance.registerPartial(name, partial)
  }

  const renderTemplate = (string: string, variables: any): string => {
    const template = instance.compile(string, {
      noEscape: true,
      strict: true,
    })

    return template(variables)
  }

  return {
    registerHelper,
    registerPartial,
    renderTemplate,
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
  } catch (e: any) {
    const errorMessage = buildErrorMessage(
      `An error occurred while rendering file: ${filePath}`,
      contents,
      e,
    )
    throw new TakomoError(errorMessage)
  }
}
