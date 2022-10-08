// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CustomConsole } = require("@jest/console")

// Fix Jest's overly verbose logging
function simpleFormatter(type, message) {
  return message
    .split(/\n/)
    .map((line) => line)
    .join("\n")
}

global.console = new CustomConsole(
  process.stdout,
  process.stderr,
  simpleFormatter,
)

jest.setTimeout(1000 * 60)
