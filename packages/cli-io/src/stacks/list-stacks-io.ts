import { ListStacksIO, ListStacksOutput } from "@takomo/stacks-commands"
import { table } from "@takomo/util"
import { createBaseIO } from "../cli-io"
import { formatStackStatus } from "../formatters"
import { formatDate, IOProps } from "./common"

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
