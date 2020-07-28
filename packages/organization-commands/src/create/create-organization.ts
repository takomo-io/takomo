import { OrganizationsClient } from "@takomo/aws-clients"
import {
  CommandStatus,
  Constants,
  initDefaultCredentialProvider,
} from "@takomo/core"
import { parseOrganizationConfigFile } from "@takomo/organization-config"
import { loadCustomPartials } from "@takomo/organization-context"
import {
  createDir,
  createFile,
  dirExists,
  fileExists,
  StopWatch,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import path from "path"
import {
  CreateOrganizationInput,
  CreateOrganizationIO,
  CreateOrganizationOutput,
} from "./model"

export const createOrganization = async (
  input: CreateOrganizationInput,
  io: CreateOrganizationIO,
): Promise<CreateOrganizationOutput> => {
  const watch = new StopWatch("total")
  const { options, featureSet } = input

  const credentialProvider = await initDefaultCredentialProvider()
  const identity = await credentialProvider.getCallerIdentity()

  if (
    !options.isAutoConfirmEnabled() &&
    !(await io.confirmOrganizationCreation(identity.accountId, featureSet))
  ) {
    return {
      message: "Cancelled",
      status: CommandStatus.CANCELLED,
      success: true,
      organization: null,
      configurationFile: null,
      watch: watch.stop(),
    }
  }

  const projectDir = input.options.getProjectDir()
  const pathToOrganizationDir = path.join(
    projectDir,
    Constants.ORGANIZATION_DIR,
  )

  const pathToOrganizationFile = path.join(
    pathToOrganizationDir,
    Constants.ORGANIZATION_CONFIG_FILE,
  )

  const organizationConfigFileExists = await fileExists(pathToOrganizationFile)

  if (organizationConfigFileExists) {
    const templateEngine = new TemplateEngine()

    await loadCustomPartials(pathToOrganizationDir, io, templateEngine)

    const organizationConfigFile = await parseOrganizationConfigFile(
      io,
      options,
      input.variables,
      pathToOrganizationFile,
      templateEngine,
    )

    const masterAccountId = organizationConfigFile.masterAccountId
    if (!masterAccountId === undefined) {
      throw new TakomoError(
        "An exiting organization configuration file found but it does not have masterAccountId property",
        {
          instructions: [
            `Either remove the existing organization configuration file or add masterAccountId property with value "${identity.accountId}" in it`,
          ],
        },
      )
    }

    if (masterAccountId !== identity.accountId) {
      throw new TakomoError(
        "An exiting organization configuration file found but its masterAccountId property does not match with the account id of current credentials",
        {
          instructions: [
            `Either remove the existing organization configuration file or set masterAccountId property value to "${identity.accountId}" in it`,
          ],
        },
      )
    }
  }

  const client = new OrganizationsClient({
    logger: io,
    credentialProvider,
    region: "us-east-1",
  })

  try {
    const organization = await client.createOrganization(featureSet)

    if (!organizationConfigFileExists) {
      const organizationConfigContent =
        `masterAccountId: "${identity.accountId}"\n` +
        "organizationalUnits:\n" +
        "  Root:\n" +
        "    accounts:\n" +
        `      - "${identity.accountId}"\n`

      if (!(await dirExists(pathToOrganizationDir))) {
        try {
          await createDir(pathToOrganizationDir)
        } catch (e) {
          io.error("Failed to create the organization configuration file", e)
          io.warn(
            "The organization was created successfully but organization configuration file could not be created. You can create it manually.",
          )
        }
      }

      try {
        await createFile(pathToOrganizationFile, organizationConfigContent)
        io.info(
          `Created organization configuration file: ${pathToOrganizationFile}`,
        )
      } catch (e) {
        io.error("Failed to create the organization configuration file", e)
        io.warn(
          "The organization was created successfully but organization configuration file could not be created. You can create it manually.",
        )
      }
    }

    return {
      message: "Success",
      status: CommandStatus.SUCCESS,
      success: true,
      organization,
      configurationFile: organizationConfigFileExists
        ? null
        : pathToOrganizationFile,
      watch: watch.stop(),
    }
  } catch (e) {
    io.error("Failed to create the organization", e)
    return {
      message: e.message,
      status: CommandStatus.FAILED,
      success: false,
      organization: null,
      configurationFile: null,
      watch: watch.stop(),
    }
  }
}
