import { Options } from "@takomo/core"
import { ListStacksIO, ListStacksOutput } from "@takomo/stacks-commands"
import { LogWriter } from "@takomo/util"
import date from "date-and-time"
import Table from "easy-table"
import CliIO from "../cli-io"
import { formatStackStatus } from "../formatters"

const formatDate = (d: any): string =>
  d ? date.format(d, "YYYY-MM-DD HH:mm:ss Z") : "-"

export class CliListStacksIO extends CliIO implements ListStacksIO {
  constructor(options: Options, logWriter: LogWriter = console.log) {
    super(logWriter, options)
  }
  printOutput = (output: ListStacksOutput): ListStacksOutput => {
    const table = new Table()
    output.stacks.forEach(({ stack, current }) => {
      table.cell("Path", stack.getPath())
      table.cell("Name", stack.getName())
      table.cell("Status", formatStackStatus(current?.StackStatus || null))
      table.cell("Created", formatDate(current?.CreationTime))
      table.cell("Updated", formatDate(current?.LastUpdatedTime))
      table.newRow()
    })

    this.message(table.toString(), true)

    return output
  }
}
