import { bold } from "../../../utils/colors"
import { BaseIO } from "../../cli-io"

export const printOutputs = (io: BaseIO): void => {
  io.message({
    text: bold("Outputs:"),
    marginTop: true,
    marginBottom: true,
  })

  io.message({ text: "  Stack outputs probably changed" })
}
