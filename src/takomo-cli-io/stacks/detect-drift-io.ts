import Table from "easy-table"
import {
  DetectDriftIO,
  DetectDriftOutput,
} from "../../command/stacks/drift/model"
import { createBaseIO } from "../cli-io"
import { formatDriftStatus, formatStackStatus } from "../formatters"
import { IOProps } from "./common"

export const createDetectDriftIO = (props: IOProps): DetectDriftIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (output: DetectDriftOutput): DetectDriftOutput => {
    const table = new Table()

    output.stacks.forEach(({ stack, current, driftDetectionStatus }) => {
      table
        .cell("Path", stack.path)
        .cell("Name", stack.name)
        .cell("Status", formatStackStatus(current?.status))
        .cell(
          "Drift status",
          formatDriftStatus(driftDetectionStatus?.stackDriftStatus),
        )
        .cell(
          "Drifted resources",
          driftDetectionStatus?.driftedStackResourceCount ?? 0,
        )
        .newRow()
    })

    io.message({
      text: table.toString(),
      marginTop: true,
    })

    return output
  }

  return {
    ...io,
    ...logger,
    printOutput,
  }
}
