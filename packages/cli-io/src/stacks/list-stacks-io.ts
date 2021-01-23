import { ListStacksIO, ListStacksOutput } from "@takomo/stacks-commands"
import date from "date-and-time"
import Table from "easy-table"
import { createBaseIO } from "../cli-io"
import { formatStackStatus } from "../formatters"
import { IOProps } from "./common"

const formatDate = (d: any): string =>
  d ? date.format(d, "YYYY-MM-DD HH:mm:ss Z") : "-"

export const createListStacksIO = (props: IOProps): ListStacksIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (output: ListStacksOutput): ListStacksOutput => {
    const table = new Table()
    output.stacks.forEach(({ stack, current }) => {
      table.cell("Path", stack.path)
      table.cell("Name", stack.name)
      table.cell("Status", formatStackStatus(current?.status))
      table.cell("Created", formatDate(current?.creationTime))
      table.cell("Updated", formatDate(current?.lastUpdatedTime))
      table.newRow()
    })

    io.message({ text: table.toString(), marginTop: true })

    return output
  }

  return {
    ...io,
    ...logger,
    printOutput,
  }
}
