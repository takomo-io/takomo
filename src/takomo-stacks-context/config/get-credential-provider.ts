import { InternalCredentialManager } from "../../takomo-aws-clients"
import { IamRoleArn } from "../../takomo-aws-model"
import { CommandRole } from "../../takomo-core"

export const getCredentialManager = async (
  commandRole: CommandRole | undefined,
  defaultCredentialManager: InternalCredentialManager,
  credentialManagers: Map<IamRoleArn, InternalCredentialManager>,
): Promise<InternalCredentialManager> => {
  if (!commandRole) {
    return defaultCredentialManager
  }

  const credentialManager = credentialManagers.get(commandRole.iamRoleArn)
  if (credentialManager) {
    return credentialManager
  }

  const newCredentialManager =
    await defaultCredentialManager.createCredentialManagerForRole(
      commandRole.iamRoleArn,
    )

  credentialManagers.set(commandRole.iamRoleArn, newCredentialManager)
  return newCredentialManager
}
