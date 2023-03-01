import { CallerIdentity, IamRoleArn } from "../../../../aws/common/model.js"
import { makeIamRoleArn } from "../../../../aws/common/util.js"
import { DeploymentTargetConfig } from "../../../../config/targets-config.js"

export const getExecutionRoleArn = (
  callerIdentity: CallerIdentity,
  target: DeploymentTargetConfig,
): IamRoleArn | undefined => {
  const accountId = target.accountId ?? callerIdentity.accountId

  if (target.deploymentRole) {
    return target.deploymentRole.iamRoleArn
  }
  if (target.deploymentRoleName) {
    return makeIamRoleArn(accountId, target.deploymentRoleName)
  }

  return undefined
}
