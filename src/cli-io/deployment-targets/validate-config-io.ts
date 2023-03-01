import {
  ValidateDeploymentTargetsConfigurationIO,
  ValidateDeploymentTargetsConfigurationOutput,
} from "../../command/targets/validate-config/model.js"
import { createBaseIO } from "../cli-io.js"
import { IOProps } from "../stacks/common.js"

export const createValidateDeploymentTargetsConfigurationIO = (
  props: IOProps,
): ValidateDeploymentTargetsConfigurationIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (
    output: ValidateDeploymentTargetsConfigurationOutput,
  ): ValidateDeploymentTargetsConfigurationOutput => {
    return output
  }

  return { ...logger, ...io, printOutput }
}
