import { DeploymentConfig } from "@aws-sdk/client-cloudformation"
import { InternalStandardStack } from "../../../../../stacks/standard-stack.js"

export const getNativeDeploymentConfig = ({
  deploymentConfig,
}: InternalStandardStack): DeploymentConfig => {
  return {
    DisableRollback: deploymentConfig.disableRollback,
    Mode: deploymentConfig.mode,
  }
}
