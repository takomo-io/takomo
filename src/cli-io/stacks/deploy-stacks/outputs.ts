import { bold } from "../../../utils/colors.js"
import { BaseIO } from "../../cli-io.js"

export const printOutputs = (io: BaseIO): void => {
  io.message({
    text: bold("Outputs:"),
    marginTop: true,
    marginBottom: true,
  })

  io.message({ text: "  Stack outputs probably changed" })
}
