import { OrganizationsClient } from "@takomo/aws-clients"
import {
  Constants,
  initDefaultCredentialProvider,
  IO,
  Options,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import {
  OrganizationConfigFile,
  parseOrganizationConfigFile,
} from "@takomo/organization-config"
import {
  dirExists,
  fileExists,
  Logger,
  readFileContents,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import path from "path"
import readdirp from "readdirp"
import { OrganizationContext } from "./organization-context"
import { validateOrganizationConfigFile } from "./validate-organization-config-file"

export const loadCustomPartials = async (
  organizationDir: string,
  logger: Logger,
  te: TemplateEngine,
): Promise<void> => {
  const partialsDirPath = path.join(organizationDir, Constants.PARTIALS_DIR)
  if (await dirExists(partialsDirPath)) {
    logger.debug(`Found partials dir: ${partialsDirPath}`)

    const partialFiles = await readdirp.promise(partialsDirPath, {
      alwaysStat: true,
      depth: 100,
      type: "files",
    })

    for (const partialFile of partialFiles) {
      const name = partialFile.fullPath.substr(partialsDirPath.length + 1)

      logger.debug(`Register partial: ${name}`)
      const contents = await readFileContents(partialFile.fullPath)
      te.registerPartial(name, contents)
    }
  } else {
    logger.debug("Partials dir not found")
  }
}

const getCredentialProviderForOrganizationAdmin = async (
  logger: Logger,
  config: OrganizationConfigFile,
  credentialProvider: TakomoCredentialProvider,
): Promise<TakomoCredentialProvider> => {
  if (config.organizationAdminRoleName) {
    const iamRoleArn = `arn:aws:iam::${config.masterAccountId}:role/${config.organizationAdminRoleName}`
    logger.debug(`Using role '${iamRoleArn}' to manage the organization`)
    return credentialProvider.createCredentialProviderForRole(iamRoleArn)
  }

  logger.debug("Using default credential provider to manage the organization")
  return credentialProvider
}

export const buildOrganizationContext = async (
  options: Options,
  variables: Variables,
  io: IO,
): Promise<OrganizationContext> => {
  const credentialProvider = await initDefaultCredentialProvider()

  const projectDir = options.getProjectDir()
  io.debug(`Current project dir: ${projectDir}`)

  const organizationDirPath = path.join(projectDir, Constants.ORGANIZATION_DIR)
  if (!(await dirExists(organizationDirPath))) {
    throw new TakomoError(
      `Takomo organization dir '${Constants.ORGANIZATION_DIR}' not found from the project dir ${projectDir}`,
    )
  }

  const pathToOrganizationConfigFile = path.join(
    organizationDirPath,
    Constants.ORGANIZATION_CONFIG_FILE,
  )
  if (!(await fileExists(pathToOrganizationConfigFile))) {
    throw new TakomoError(
      `Takomo organization configuration file '${Constants.ORGANIZATION_CONFIG_FILE}' not found from the organization dir ${organizationDirPath}`,
    )
  }

  const templateEngine = new TemplateEngine()

  await loadCustomPartials(organizationDirPath, io, templateEngine)

  const organizationConfigFile = await parseOrganizationConfigFile(
    io,
    options,
    variables,
    pathToOrganizationConfigFile,
    templateEngine,
  )

  const organizationAdminCredentialProvider = await getCredentialProviderForOrganizationAdmin(
    io,
    organizationConfigFile,
    credentialProvider,
  )

  const client = new OrganizationsClient({
    region: "us-east-1",
    credentialProvider: organizationAdminCredentialProvider,
    logger: io.childLogger("http"),
  })

  const [callerIdentity, organization] = await Promise.all([
    organizationAdminCredentialProvider.getCallerIdentity(),
    client.describeOrganization(),
  ])

  validateOrganizationConfigFile(
    organizationConfigFile,
    callerIdentity,
    organization,
  )

  return new OrganizationContext({
    variables,
    options,
    logger: io,
    credentialProvider,
    organizationAdminCredentialProvider,
    organizationConfigFile,
  })
}
