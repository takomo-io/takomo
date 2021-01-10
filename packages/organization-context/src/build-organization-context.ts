import {
  createOrganizationsClient,
  CredentialManager,
  initDefaultCredentialManager,
} from "@takomo/aws-clients"
import { CommandContext } from "@takomo/core"
import { OrganizationConfig } from "@takomo/organization-config"
import { TkmLogger } from "@takomo/util"
import { OrganizationConfigRepository } from "./model"
import {
  createOrganizationContext,
  OrganizationContext,
} from "./organization-context"
import { validateOrganizationConfigFile } from "./validate-organization-config-file"

const getCredentialManagererForOrganizationAdmin = async (
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
  ctx: CommandContext,
  configRepository: OrganizationConfigRepository,
  logger: TkmLogger,
): Promise<OrganizationContext> => {
  const credentialManager = await initDefaultCredentialManager()

  // const projectDir = options.projectDir
  // io.debug(`Current project dir: ${projectDir}`)
  //
  // const organizationDirPath = path.join(projectDir, Constants.ORGANIZATION_DIR)
  // if (!(await dirExists(organizationDirPath))) {
  //   throw new TakomoError(
  //     `Takomo organization dir '${Constants.ORGANIZATION_DIR}' not found from the project dir ${projectDir}`,
  //   )
  // }
  //
  // const pathToOrganizationConfigFile = path.join(
  //   organizationDirPath,
  //   Constants.ORGANIZATION_CONFIG_FILE,
  // )
  // if (!(await fileExists(pathToOrganizationConfigFile))) {
  //   throw new TakomoError(
  //     `Takomo organization configuration file '${Constants.ORGANIZATION_CONFIG_FILE}' not found from the organization dir ${organizationDirPath}`,
  //   )
  // }

  // const templateEngine = new TemplateEngine()
  //
  // await loadCustomPartials(organizationDirPath, io, templateEngine)
  //
  const organizationConfig = await configRepository.getOrganizationConfig()

  // const organizationConfigFile = await parseOrganizationConfigFile(
  //   io,
  //   ctx,
  //   organizationConfigObject,
  // )

  const organizationAdminCredentialManager = await getCredentialManagererForOrganizationAdmin(
    logger,
    organizationConfig,
    credentialManager,
  )

  const client = createOrganizationsClient({
    region: "us-east-1",
    credentialManager: organizationAdminCredentialManager,
    logger: logger.childLogger("http"),
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
