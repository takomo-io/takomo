import { indentLines, LogLevel, TakomoError } from "../takomo-util"
import { BaseIO } from "./cli-io"

export const printError = (
  io: BaseIO,
  error: Error,
  logLevel: LogLevel,
  indent: number,
): void => {
  io.message({
    text: "Error:",
    marginTop: true,
    indent: indent + 2,
  })

  if (error instanceof TakomoError) {
    io.message({ text: indentLines(error.message, 4) })
    if (error.info) {
      io.message({
        text: "Additional info:",
        indent: indent + 4,
        marginTop: true,
      })

      io.message({ text: error.info, indent: indent + 6 })
    }

    if (error.instructions) {
      io.message({
        text: "How to fix:",
        indent: indent + 4,
        marginTop: true,
      })

      error.instructions.forEach((instruction) => {
        io.message({ text: `- ${instruction}`, indent: indent + 6 })
      })
    }
  } else {
    io.message({ text: `${error}`, indent: indent + 4 })
  }

  if ((error.stack && logLevel === "debug") || logLevel === "trace") {
    io.message({
      text: "Stack trace:",
      marginTop: true,
      indent: indent + 4,
    })

    io.message({
      text: indentLines(`${error.stack}`, indent + 6),
    })
  }
}
