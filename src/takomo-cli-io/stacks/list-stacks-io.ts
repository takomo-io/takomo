import Table from "easy-table"
import { ListStacksIO, ListStacksOutput } from "../../takomo-stacks-commands"
import { toPrettyJson } from "../../utils/json"
import { formatYaml } from "../../utils/yaml"
import { createBaseIO } from "../cli-io"
import { formatStackStatus } from "../formatters"
import { formatDate, IOProps } from "./common"

export const createListStacksIO = (props: IOProps): ListStacksIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (output: ListStacksOutput): ListStacksOutput => {
    const { outputFormat, results } = output
    switch (outputFormat) {
      case "json":
        io.message({
          text: toPrettyJson({
            results,
            status: output.status,
            success: output.success,
            message: output.message,
            error: output.error,
            time: output.timer.getTimeElapsed(),
          }),
        })
        break
      case "yaml":
        io.message({
          text: formatYaml({
            results,
            status: output.status,
            success: output.success,
            message: output.message,
            error: output.error,
            time: output.timer.getTimeElapsed(),
          }),
        })
        break
      default:
        const table = new Table()

        results.forEach((stack) => {
          table
            .cell("Path", stack.path)
            .cell("Name", stack.name)
            .cell("Status", formatStackStatus(stack.status))
            .cell("Created", formatDate(stack.createdTime))
            .cell("Updated", formatDate(stack.updatedTime))
            .newRow()
        })

        io.message({
          text: table.toString(),
          marginTop: true,
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
