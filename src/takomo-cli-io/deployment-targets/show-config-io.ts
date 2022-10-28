import {
  ShowDeploymentTargetsConfigurationIO,
  ShowDeploymentTargetsConfigurationOutput,
} from "../../takomo-deployment-targets-commands/show-config/model"
import { formatYaml, toPrettyJson } from "../../takomo-util"
import { createBaseIO } from "../cli-io"
import { IOProps } from "../stacks/common"

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
            time: output.timer.getSecondsElapsed(),
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
            time: output.timer.getSecondsElapsed(),
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
