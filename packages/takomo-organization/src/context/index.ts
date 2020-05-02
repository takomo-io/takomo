import { OrganizationsClient } from "@takomo/aws-clients"
import { ConfigSet } from "@takomo/config-sets"
import {
  Constants,
  initDefaultCredentialProvider,
  IO,
  Options,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import {
  collectFromHierarchy,
  deepCopy,
  dirExists,
  fileExists,
  Logger,
  readFileContents,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import path from "path"
import readdirp from "readdirp"
import { parseOrganizationConfigFile } from "../config"
import { OrganizationalUnit, OrganizationConfigFile } from "../model"
import { validateOrganizationConfigFile } from "../validation"

const loadCustomPartials = async (
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

export interface OrganizationContextProps {
  readonly credentialProvider: TakomoCredentialProvider
  readonly organizationAdminCredentialProvider: TakomoCredentialProvider
  readonly logger: Logger
  readonly options: Options
  readonly variables: Variables
  readonly organizationConfigFile: OrganizationConfigFile
}

export class OrganizationContext {
  private readonly credentialProvider: TakomoCredentialProvider
  private readonly organizationAdminCredentialProvider: TakomoCredentialProvider
  private readonly logger: Logger
  private readonly options: Options
  private readonly variables: Variables
  private readonly organizationConfigFile: OrganizationConfigFile
  private readonly organizationalUnits: OrganizationalUnit[]

  constructor(props: OrganizationContextProps) {
    this.credentialProvider = props.credentialProvider
    this.organizationAdminCredentialProvider =
      props.organizationAdminCredentialProvider
    this.logger = props.logger
    this.options = props.options
    this.variables = props.variables
    this.organizationConfigFile = props.organizationConfigFile
    this.organizationalUnits = collectFromHierarchy(
      props.organizationConfigFile.organizationalUnits.Root,
      o => o.children,
    )
  }

  getClient = (): OrganizationsClient =>
    new OrganizationsClient({
      region: "us-east-1",
      credentialProvider: this.organizationAdminCredentialProvider,
      logger: this.logger.childLogger("http"),
    })

  hasOrganizationalUnit = (path: string): boolean =>
    this.organizationalUnits.find(ou => ou.path === path) !== undefined

  getOrganizationalUnit = (path: string): OrganizationalUnit => {
    const ou = this.organizationalUnits.find(ou => ou.path === path)
    if (!ou) {
      throw new Error(`No such organizational unit: '${path}'`)
    }

    return ou
  }

  getOptions = (): Options => this.options
  getLogger = (): Logger => this.logger
  getVariables = (): Variables => deepCopy(this.variables)
  getCredentialProvider = (): TakomoCredentialProvider =>
    this.credentialProvider
  getOrganizationConfigFile = (): OrganizationConfigFile =>
    this.organizationConfigFile

  getConfigSet = (name: string): ConfigSet => {
    const configSet = this.organizationConfigFile.configSets.find(
      r => r.name === name,
    )
    if (!configSet) {
      throw new Error(`No such config set: ${name}`)
    }

    return configSet
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
    credentialProvider: credentialProvider,
    organizationAdminCredentialProvider,
    organizationConfigFile,
  })
}
