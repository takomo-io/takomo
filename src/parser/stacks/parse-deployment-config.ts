import { DeploymentConfigObject } from "../../config/common-config.js"

export const parseDeploymentConfig = (
  value: any,
): DeploymentConfigObject | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  return {
    mode: value.mode,
    disableRollback: value.disableRollback,
  }
}
