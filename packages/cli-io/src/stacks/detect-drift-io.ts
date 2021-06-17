import { DetectDriftIO, DetectDriftOutput } from "@takomo/stacks-commands"
import { table } from "@takomo/util"
import { createBaseIO } from "../cli-io"
import { formatDriftStatus, formatStackStatus } from "../formatters"
import { IOProps } from "./common"

export const createDetectDriftIO = (props: IOProps): DetectDriftIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (output: DetectDriftOutput): DetectDriftOutput => {
    const headers = [
      "Path",
      "Name",
      "Status",
      "Drift status",
      "Drifted resources",
    ]

    const stacksTable = output.stacks.reduce(
      (tbl, { stack, current, driftDetectionStatus }) =>
        tbl.row(
          stack.path,
          stack.name,
          formatStackStatus(current?.status),
          formatDriftStatus(driftDetectionStatus?.stackDriftStatus),
          driftDetectionStatus?.driftedStackResourceCount ?? 0,
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
