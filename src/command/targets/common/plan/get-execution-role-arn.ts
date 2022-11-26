import {
  CallerIdentity,
  IamRoleArn,
  makeIamRoleArn,
} from "../../../../takomo-aws-model"
import { ConfigSetType } from "../../../../takomo-config-sets"
import { DeploymentTargetConfig } from "../../../../takomo-deployment-targets-config"

export const getExecutionRoleArn = (
  configSetType: ConfigSetType,
  callerIdentity: CallerIdentity,
  target: DeploymentTargetConfig,
): IamRoleArn | undefined => {
  const accountId = target.accountId ?? callerIdentity.accountId
  switch (configSetType) {
    case "bootstrap":
      if (target.bootstrapRole) {
        return target.bootstrapRole.iamRoleArn
      }
      if (target.bootstrapRoleName) {
        return makeIamRoleArn(accountId, target.bootstrapRoleName)
      }
      return undefined
    case "standard":
      if (target.deploymentRole) {
        return target.deploymentRole.iamRoleArn
      }
      if (target.deploymentRoleName) {
        return makeIamRoleArn(accountId, target.deploymentRoleName)
      }

      return undefined
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}
