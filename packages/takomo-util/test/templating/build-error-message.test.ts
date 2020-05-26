import { buildErrorMessage } from "../../src/templating/internal"

const error = (
  message: string,
  lineNumber?: number,
  endLineNumber?: number,
  column?: number,
  endColumn?: number,
): Error => {
  const error = new Error(message) as any
  if (lineNumber) {
    error.lineNumber = lineNumber
  }
  if (endLineNumber) {
    error.endLineNumber = endLineNumber
  }
  if (column) {
    error.column = column
  }
  if (endColumn) {
    error.endColumn = endColumn
  }
  return error
}

describe("#buildErrorMessage", () => {
  describe("when a plain error without detailed information is given", () => {
    test("returns an error message containing just the original error message", () => {
      const filePath = "/tmp/file.hbs"
      const contents = "template contents"
      const message = "Oh no!"
      const expected = `An error occurred while rendering file: ${filePath}\n\n${message}\n`
      expect(buildErrorMessage(filePath, contents, error(message))).toBe(
        expected,
      )
    })
  })

  describe("when an error with detailed information with different start and end line numbers is given", () => {
    test("returns an error message without the code snippet of surrounding template contents", () => {
      const filePath = "/tmp/file.hbs"
      const contents = "line1\nline2\nline3"
      const message = "All went wrong!"
      const lineNumber = 1
      const endLineNumber = 3
      const column = 1
      const endColumn = 2

      const err = error(message, lineNumber, endLineNumber, column, endColumn)

      const expected =
        `An error occurred while rendering file: ${filePath}\n\n` +
        `message:  ${message}\n` +
        `line:     ${lineNumber}\n` +
        `column:   ${column}`

      expect(buildErrorMessage(filePath, contents, err)).toBe(expected)
    })
  })

  describe("when an error that occurred in the first line with detailed information with is given", () => {
    test("returns an error message with the code snippet of surrounding template contents", () => {
      const filePath = "/tmp/file.hbs"
      const contents =
        "first line {{ IT WAS HERE }} here\nline2\nline3\nline4\nline5\nline6\nline7\nline8"
      const message = "All went wrong!"
      const lineNumber = 1
      const endLineNumber = 1
      const column = 11
      const endColumn = 28

      const err = error(message, lineNumber, endLineNumber, column, endColumn)

      const expected =
        `An error occurred while rendering file: ${filePath}\n\n` +
        `message:  ${message}\n` +
        `line:     ${lineNumber}\n` +
        `column:   ${column}\n\n` +
        "  1:  first line {{ IT WAS HERE }} here\n" +
        "                 ^^^^^^^^^^^^^^^^^\n" +
        "  2:  line2\n" +
        "  3:  line3\n" +
        "  4:  line4"

      expect(buildErrorMessage(filePath, contents, err)).toBe(expected)
    })
  })

  describe("when an error that occurred in the last line with detailed information with is given", () => {
    test("returns an error message with the code snippet of surrounding template contents", () => {
      const filePath = "/tmp/file.hbs"
      const contents =
        "line1\nline2\nline3\nline4\nline5\nline6\nline7\nhello {{ HERE }}"
      const message = "All went wrong!"
      const lineNumber = 8
      const endLineNumber = 8
      const column = 6
      const endColumn = 16

      const err = error(message, lineNumber, endLineNumber, column, endColumn)

      const expected =
        `An error occurred while rendering file: ${filePath}\n\n` +
        `message:  ${message}\n` +
        `line:     ${lineNumber}\n` +
        `column:   ${column}\n\n` +
        "  5:  line5\n" +
        "  6:  line6\n" +
        "  7:  line7\n" +
        "  8:  hello {{ HERE }}\n" +
        "            ^^^^^^^^^^"

      expect(buildErrorMessage(filePath, contents, err)).toBe(expected)
    })
  })

  describe("when an error that occurred in line 4 with detailed information with is given", () => {
    test("returns an error message with the code snippet of surrounding template contents", () => {
      const filePath = "/tmp/file.hbs"
      const contents =
        "line1\nline2\nline3\nhello! {{ IT WAS HERE }} world\nline5\nline6\nline7\nline8"
      const message = "All went wrong!"
      const lineNumber = 4
      const endLineNumber = 4
      const column = 7
      const endColumn = 24

      const err = error(message, lineNumber, endLineNumber, column, endColumn)

      const expected =
        `An error occurred while rendering file: ${filePath}\n\n` +
        `message:  ${message}\n` +
        `line:     ${lineNumber}\n` +
        `column:   ${column}\n\n` +
        "  1:  line1\n" +
        "  2:  line2\n" +
        "  3:  line3\n" +
        "  4:  hello! {{ IT WAS HERE }} world\n" +
        "             ^^^^^^^^^^^^^^^^^\n" +
        "  5:  line5\n" +
        "  6:  line6\n" +
        "  7:  line7"

      expect(buildErrorMessage(filePath, contents, err)).toBe(expected)
    })
  })
})
