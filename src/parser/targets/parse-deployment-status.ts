import { DeploymentStatus } from "../../targets/targets-model.js"

export const parseDeploymentStatus = (value: any): DeploymentStatus => {
  if (!value) {
    return "active"
  }

  switch (value) {
    case "active":
      return "active"
    case "disabled":
      return "disabled"
    default:
      throw new Error(`Unsupported deployment status: '${value}'`)
  }
}
