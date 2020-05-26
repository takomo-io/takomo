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

export const buildErrorMessage = <E extends Error>(
  filePath: string,
  contents: string,
  originalError: any,
): string => {
  const {
    lineNumber,
    endLineNumber,
    column,
    endColumn,
    message,
  } = originalError

  if (!lineNumber || !endLineNumber || !column || !endColumn) {
    return `An error occurred while rendering file: ${filePath}\n\n${message}\n`
  }

  if (lineNumber !== endLineNumber) {
    return (
      `An error occurred while rendering file: ${filePath}\n\n` +
      `message:  ${message}\n` +
      `line:     ${lineNumber}\n` +
      `column:   ${column}`
    )
  }

  const lines = contents.split("\n")
  const lineCount = lines.length
  const firstLineNumber = calculateFirstLineToInclude(lineNumber)
  const lastLineNumber = calculateLastLineToInclude(lineNumber, lineCount)

  const lineNumberColumnWidth =
    Math.max(`${firstLineNumber}`.length, `${lastLineNumber}`.length) + 2

  const includedLines = lines
    .slice(firstLineNumber - 1, lastLineNumber)
    .map(
      (line, n) =>
        `${firstLineNumber + n}`.padStart(lineNumberColumnWidth) + ":  " + line,
    )

  includedLines.splice(
    lineNumber - firstLineNumber + 1,
    0,
    "^"
      .repeat(endColumn - column)
      .padStart(endColumn + lineNumberColumnWidth + 3),
  )

  return (
    `An error occurred while rendering file: ${filePath}\n\n` +
    `message:  ${message}\n` +
    `line:     ${lineNumber}\n` +
    `column:   ${column}\n\n` +
    includedLines.join("\n")
  )
}
