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
