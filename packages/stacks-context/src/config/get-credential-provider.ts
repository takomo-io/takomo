import { CommandRole, IamRoleArn, TakomoCredentialProvider } from "@takomo/core"

export const getCredentialProvider = async (
  commandRole: CommandRole | null,
  defaultCredentialProvider: TakomoCredentialProvider,
  credentialProviders: Map<IamRoleArn, TakomoCredentialProvider>,
): Promise<TakomoCredentialProvider> => {
  if (!commandRole) {
    return defaultCredentialProvider
  }

  const credentialProvider = credentialProviders.get(commandRole.iamRoleArn)
  if (credentialProvider) {
    return credentialProvider
  }

  const newCredentialProvider = await defaultCredentialProvider.createCredentialProviderForRole(
    commandRole.iamRoleArn,
  )

  credentialProviders.set(commandRole.iamRoleArn, newCredentialProvider)
  return newCredentialProvider
}
