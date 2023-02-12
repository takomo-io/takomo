import {
  ValidateDeploymentTargetsConfigurationIO,
  ValidateDeploymentTargetsConfigurationOutput,
} from "../../command/targets/validate-config/model"
import { createBaseIO } from "../cli-io"
import { IOProps } from "../stacks/common"

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
