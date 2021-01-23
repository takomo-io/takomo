import { StackEvent } from "@takomo/aws-model"
import { StacksOperationOutput } from "@takomo/stacks-commands"
import { CommandPath, StackGroup, StackResult } from "@takomo/stacks-model"
import { collectFromHierarchy, LogLevel } from "@takomo/util"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import { BaseIO } from "../cli-io"
import { printError } from "../common"
import { formatCommandStatus, formatStackEvent } from "../formatters"

/**
 * @hidden
 */
export const chooseCommandPathInternal = async (
  io: BaseIO,
  rootStackGroup: StackGroup,
): Promise<CommandPath> => {
  const allStackGroups = collectFromHierarchy(rootStackGroup, (s) => s.children)

  const allCommandPaths = allStackGroups.reduce(
    (collected, stackGroup) => [
      ...collected,
      stackGroup.path,
      ...stackGroup.stacks.map((s) => s.path),
    ],
    new Array<string>(),
  )

  const source = async (answersSoFar: any, input: string): Promise<string[]> =>
    input ? allCommandPaths.filter((p) => p.includes(input)) : allCommandPaths

  return io.autocomplete("Choose command path", source)
}

/**
 * @hidden
 */
export const printFailedStackResults = (
  io: BaseIO,
  failed: ReadonlyArray<StackResult>,
  logLevel: LogLevel,
  indent: number,
): void => {
  failed.forEach((r) => {
    io.message({
      text: `- Stack path: ${r.stack.path}`,
      marginTop: true,
      indent,
    })
    io.message({
      text: `Stack name: ${r.stack.name}`,
      indent: indent + 2,
    })

    if (r.events.length > 0) {
      io.message({
        text: "Stack events:",
        marginTop: true,
        indent: indent + 2,
      })
      const fn = (e: StackEvent) =>
        io.message({ text: formatStackEvent(e), indent: indent + 4 })
      r.events.forEach(fn)
    }

    if (r.error) {
      printError(io, r.error, logLevel, indent)
    }
  })
}

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

  const failed = output.results.filter(
    (r) => !r.success && r.status === "FAILED",
  )

  const table = new Table()

  output.results.forEach((r) => {
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

    printFailedStackResults(io, failed, logLevel, 0)
  }

  return output
}
