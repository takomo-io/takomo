import { StackEvent } from "@takomo/aws-model"
import { StacksOperationOutput } from "@takomo/stacks-commands"
import { indentLines, LogLevel, TakomoError } from "@takomo/util"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import { BaseIO } from "../cli-io"
import { formatCommandStatus, formatStackEvent } from "../formatters"

/**
 * @hidden
 */
export const printStacksOperationOutput = (
  io: BaseIO,
  output: StacksOperationOutput,
  logLevel: LogLevel,
): StacksOperationOutput => {
  if (output.results.length === 0) {
    return output
  }

  const succeeded = output.results.filter((r) => r.success)
  const failed = output.results.filter((r) => !r.success)
  const all = [...succeeded, ...failed]

  const table = new Table()

  all.forEach((r) => {
    table.cell("Stack path", r.stack.path)
    table.cell("Stack name", r.stack.name)
    table.cell("Status", formatCommandStatus(r.status))
    table.cell("Time", prettyMs(r.timer.getSecondsElapsed()))
    table.cell("Message", r.message)
    table.newRow()
  })

  io.message({ text: table.toString(), marginTop: true })

  if (failed.length > 0) {
    io.subheader({
      text: "More information about the failed stacks",
      marginTop: true,
    })

    failed.forEach((r) => {
      io.message({
        text: `- Stack path: ${r.stack.path}`,
        marginTop: true,
      })
      io.message({
        text: `Stack name: ${r.stack.name}`,
        indent: 2,
      })

      if (r.events.length > 0) {
        io.message({
          text: "Stack events:",
          marginTop: true,
          indent: 2,
        })
        const fn = (e: StackEvent) =>
          io.message({ text: formatStackEvent(e), indent: 4 })
        r.events.forEach(fn)
      }

      if (r.error) {
        io.message({
          text: "Error:",
          marginTop: true,
          indent: 2,
        })

        const error = r.error

        if (error instanceof TakomoError) {
          io.message({ text: error.message, indent: 4 })
          if (error.info) {
            io.message({
              text: "Additional info:",
              indent: 4,
              marginTop: true,
            })

            io.message({ text: error.info, indent: 6 })
          }

          if (error.instructions) {
            io.message({
              text: "How to fix:",
              indent: 4,
              marginTop: true,
            })

            error.instructions.forEach((instruction) => {
              io.message({ text: `- ${instruction}`, indent: 6 })
            })
          }
        } else {
          io.message({ text: `${error}`, indent: 4 })
        }

        if ((error.stack && logLevel === "debug") || logLevel === "trace") {
          io.message({
            text: "Stack trace:",
            marginTop: true,
            indent: 4,
          })

          io.message({
            text: indentLines(`${error.stack}`, 6),
          })
        }
      }
    })
  }

  return output
}
