import {
  createOrganizationsClient,
  CredentialManager,
} from "@takomo/aws-clients"
import { InternalCommandContext } from "@takomo/core"
import { OrganizationConfig } from "@takomo/organization-config"
import { TkmLogger, uuid } from "@takomo/util"
import { OrganizationConfigRepository } from "./model"
import {
  createOrganizationContext,
  OrganizationContext,
} from "./organization-context"
import { validateOrganizationConfigFile } from "./validate-organization-config-file"

const getCredentialManagerForOrganizationAdmin = async (
  logger: TkmLogger,
  config: OrganizationConfig,
  credentialManager: CredentialManager,
): Promise<CredentialManager> => {
  if (config.organizationAdminRoleName) {
    const iamRoleArn = `arn:aws:iam::${config.masterAccountId}:role/${config.organizationAdminRoleName}`
    logger.debug(`Using role '${iamRoleArn}' to manage the organization`)
    return credentialManager.createCredentialManagerForRole(iamRoleArn)
  }

  logger.debug("Using default credential manager to manage the organization")
  return credentialManager
}

export const buildOrganizationContext = async (
  ctx: InternalCommandContext,
  configRepository: OrganizationConfigRepository,
  logger: TkmLogger,
  credentialManager: CredentialManager,
): Promise<OrganizationContext> => {
  const organizationConfig = await configRepository.getOrganizationConfig()

  const organizationAdminCredentialManager = await getCredentialManagerForOrganizationAdmin(
    logger,
    organizationConfig,
    credentialManager,
  )

  const client = createOrganizationsClient({
    region: "us-east-1",
    credentialManager: organizationAdminCredentialManager,
    logger: logger.childLogger("http"),
    id: uuid(),
  })

  const [callerIdentity, organization] = await Promise.all([
    organizationAdminCredentialManager.getCallerIdentity(),
    client.describeOrganization(),
  ])

  validateOrganizationConfigFile(
    organizationConfig,
    callerIdentity,
    organization,
  )

  return createOrganizationContext({
    ctx,
    configRepository,
    organizationAdminCredentialManager,
    organizationConfig,
    credentialManager,
    logger,
  })
}
