import {
  ShowDeploymentTargetsConfigurationIO,
  ShowDeploymentTargetsConfigurationOutput,
} from "../../command/targets/show-config/model.js"
import { toPrettyJson } from "../../utils/json.js"
import { formatYaml } from "../../utils/yaml.js"
import { createBaseIO } from "../cli-io.js"
import { IOProps } from "../stacks/common.js"

export const createShowDeploymentTargetsConfigurationIO = (
  props: IOProps,
): ShowDeploymentTargetsConfigurationIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (
    output: ShowDeploymentTargetsConfigurationOutput,
  ): ShowDeploymentTargetsConfigurationOutput => {
    const { outputFormat, result } = output
    switch (outputFormat) {
      case "json":
        io.message({
          text: toPrettyJson({
            result,
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
            result,
            status: output.status,
            success: output.success,
            message: output.message,
            error: output.error,
            time: output.timer.getTimeElapsed(),
          }),
        })
        break
      default:
        io.message({ text: formatYaml(result) })
    }

    return output
  }

  return { ...logger, ...io, printOutput }
}
