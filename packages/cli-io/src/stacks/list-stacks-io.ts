import { ListStacksIO, ListStacksOutput } from "@takomo/stacks-commands"
import { formatYaml, table, toPrettyJson } from "@takomo/util"
import { createBaseIO } from "../cli-io"
import { formatStackStatus } from "../formatters"
import { formatDate, IOProps } from "./common"

export const createListStacksIO = (props: IOProps): ListStacksIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (output: ListStacksOutput): ListStacksOutput => {
    const { outputFormat, stacks } = output
    switch (outputFormat) {
      case "json":
        io.message({
          text: toPrettyJson({
            stacks,
            status: output.status,
            success: output.success,
            message: output.message,
            error: output.error,
            time: output.timer.getSecondsElapsed(),
          }),
        })
        break
      case "yaml":
        io.message({
          text: formatYaml({
            stacks,
            status: output.status,
            success: output.success,
            message: output.message,
            error: output.error,
            time: output.timer.getSecondsElapsed(),
          }),
        })
        break
      default:
        const headers = ["Path", "Name", "Status", "Created", "Updated"]

        const stacksTable = stacks.reduce(
          (tbl, stack) =>
            tbl.row(
              stack.path,
              stack.name,
              formatStackStatus(stack.status),
              formatDate(stack.createdTime),
              formatDate(stack.updatedTime),
            ),
          table({ headers }),
        )

        io.table({
          showHeaders: true,
          marginTop: true,
          table: stacksTable,
        })
    }

    return output
  }

  return {
    ...io,
    ...logger,
    printOutput,
  }
}
