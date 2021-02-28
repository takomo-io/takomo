import { ListStacksIO, ListStacksOutput } from "@takomo/stacks-commands"
import { table } from "@takomo/util"
import date from "date-and-time"
import { createBaseIO } from "../cli-io"
import { formatStackStatus } from "../formatters"
import { IOProps } from "./common"

const formatDate = (d: any): string =>
  d ? date.format(d, "YYYY-MM-DD HH:mm:ss Z") : "-"

export const createListStacksIO = (props: IOProps): ListStacksIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (output: ListStacksOutput): ListStacksOutput => {
    const headers = ["Path", "Name", "Status", "Created", "Updated"]

    const stacksTable = output.stacks.reduce(
      (tbl, { stack, current }) =>
        tbl.row(
          stack.path,
          stack.name,
          formatStackStatus(current?.status),
          formatDate(current?.creationTime),
          formatDate(current?.lastUpdatedTime),
        ),
      table({ headers }),
    )

    io.table({
      showHeaders: true,
      marginTop: true,
      table: stacksTable,
    })

    return output
  }

  return {
    ...io,
    ...logger,
    printOutput,
  }
}
