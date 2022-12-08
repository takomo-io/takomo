import { CallerIdentity, IamRoleArn } from "../../../../aws/common/model"
import { makeIamRoleArn } from "../../../../aws/common/util"
import { ConfigSetType } from "../../../../config-sets/config-set-model"
import { DeploymentTargetConfig } from "../../../../config/targets-config"

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
