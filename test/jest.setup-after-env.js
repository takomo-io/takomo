import { CustomConsole } from "@jest/console"
import { jest } from "@jest/globals"

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

jest.setTimeout(1000 * 60 * 2)
