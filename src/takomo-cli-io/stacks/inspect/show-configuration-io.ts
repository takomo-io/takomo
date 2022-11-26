import {
  ShowConfigurationIO,
  ShowConfigurationOutput,
} from "../../../command/stacks/inspect/configuration/model"
import { StackGroup } from "../../../takomo-stacks-model"
import { toPrettyJson } from "../../../utils/json"
import { formatYaml } from "../../../utils/yaml"
import { createBaseIO } from "../../cli-io"
import { chooseCommandPathInternal, IOProps } from "../common"

export const createShowConfigurationIO = (
  props: IOProps,
): ShowConfigurationIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (
    output: ShowConfigurationOutput,
  ): ShowConfigurationOutput => {
    const { stacks, outputFormat } = output

    switch (outputFormat) {
      case "json":
        io.message({
          text: toPrettyJson({
            stacks,
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
            stacks,
            status: output.status,
            success: output.success,
            message: output.message,
            error: output.error,
            time: output.timer.getTimeElapsed(),
          }),
        })
        break
      default:
        io.message({ text: toPrettyJson(stacks) })
    }

    return output
  }

  const chooseCommandPath = (rootStackGroup: StackGroup) =>
    chooseCommandPathInternal(io, rootStackGroup)

  return {
    ...logger,
    chooseCommandPath,
    printOutput,
  }
}
