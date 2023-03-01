import {
  ShowConfigurationIO,
  ShowConfigurationOutput,
} from "../../../command/stacks/inspect/configuration/model.js"
import { StackGroup } from "../../../stacks/stack-group.js"
import { toPrettyJson } from "../../../utils/json.js"
import { formatYaml } from "../../../utils/yaml.js"
import { createBaseIO } from "../../cli-io.js"
import { chooseCommandPathInternal, IOProps } from "../common.js"

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
