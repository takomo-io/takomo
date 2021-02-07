import { OrganizationPolicyType } from "@takomo/aws-model"
import { CommandContext, TakomoProjectConfig } from "@takomo/core"
import {
  createAccountConfigItemSchema,
  createAccountRepositoryRegistry,
  createFileSystemAccountRepositoryProvider,
} from "@takomo/organization-account-repository"
import {
  buildOrganizationConfig,
  OrganizationConfig,
} from "@takomo/organization-config"
import { OrganizationConfigRepository } from "@takomo/organization-context"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import {
  collectFromHierarchy,
  createDir,
  createFile,
  dirExists,
  fileExists,
  FilePath,
  readFileContents,
  TakomoError,
  TemplateEngine,
  TkmLogger,
} from "@takomo/util"
import path from "path"
import R from "ramda"
import dedent from "ts-dedent"
import {
  createFileSystemStacksConfigRepository,
  FileSystemStacksConfigRepositoryProps,
} from "../stacks/config-repository"
import { parseOrganizationConfigFile } from "./parser"

interface FileSystemOrganizationConfigRepositoryProps
  extends FileSystemStacksConfigRepositoryProps {
  readonly organizationDir: FilePath
  readonly organizationTagPoliciesDir: FilePath
  readonly organizationBackupPoliciesDir: FilePath
  readonly organizationServiceControlPoliciesDir: FilePath
  readonly organizationAiServicesOptOutPoliciesDir: FilePath
  readonly defaultOrganizationConfigFileName: string
  readonly projectConfig?: TakomoProjectConfig
}

const loadExternallyPersistedAccounts = async (
  ctx: CommandContext,
  logger: TkmLogger,
  templateEngine: TemplateEngine,
  organizationDir: FilePath,
  projectConfig?: TakomoProjectConfig,
): Promise<Map<OrganizationalUnitPath, ReadonlyArray<unknown>>> => {
  if (projectConfig?.organization?.accountRepository === undefined) {
    return new Map()
  }

  const registry = createAccountRepositoryRegistry()
  registry.registerAccountRepositoryProvider(
    "filesystem",
    createFileSystemAccountRepositoryProvider(),
  )

  const repository = await registry.initAccountRepository({
    logger,
    ctx,
    templateEngine,
    config: projectConfig.organization.accountRepository,
  })

  const accounts = await repository.listAccounts()

  const schema = createAccountConfigItemSchema({
    regions: ctx.regions,
    trustedAwsServices: ctx.organizationServicePrincipals,
  })

  accounts.forEach((wrapper) => {
    const { error } = schema.validate(wrapper.item, { abortEarly: false })
    if (error) {
      const details = error.details.map((m) => `  - ${m.message}`).join("\n")
      throw new TakomoError(
        `Validation errors in account configuration '${wrapper.source}':\n\n${details}`,
      )
    }
  })

  const accountsByOu = new Map(
    Array.from(
      Object.entries(
        R.groupBy(
          (a) => a.organizationalUnitPath,
          accounts.map((w) => w.item),
        ),
      ),
    ),
  )

  return new Map(
    Array.from(accountsByOu.entries()).map(([ou, configs]) => [
      ou,
      configs.map((c) => c.config),
    ]),
  )
}

export const createFileSystemOrganizationConfigRepository = async (
  props: FileSystemOrganizationConfigRepositoryProps,
): Promise<OrganizationConfigRepository> => {
  const stacksConfigRepository = await createFileSystemStacksConfigRepository(
    props,
  )

  const {
    organizationDir,
    organizationTagPoliciesDir,
    organizationBackupPoliciesDir,
    organizationServiceControlPoliciesDir,
    organizationAiServicesOptOutPoliciesDir,
    defaultOrganizationConfigFileName,
    ctx,
    logger,
    projectConfig,
  } = props

  const getOrganizationPolicyDir = (
    policyType: OrganizationPolicyType,
  ): FilePath => {
    switch (policyType) {
      case "AISERVICES_OPT_OUT_POLICY":
        return organizationAiServicesOptOutPoliciesDir
      case "BACKUP_POLICY":
        return organizationBackupPoliciesDir
      case "SERVICE_CONTROL_POLICY":
        return organizationServiceControlPoliciesDir
      case "TAG_POLICY":
        return organizationTagPoliciesDir
      default:
        throw new Error(`Unsupported organization policy type: ${policyType}`)
    }
  }

  return {
    ...stacksConfigRepository,

    getOrganizationConfig: async (): Promise<OrganizationConfig> => {
      const pathToConfigFile = path.join(
        organizationDir,
        defaultOrganizationConfigFileName,
      )

      if (!(await fileExists(pathToConfigFile))) {
        throw new TakomoError(
          `Takomo organization configuration file not found from path: ${pathToConfigFile}`,
        )
      }

      const parsedFile = await parseOrganizationConfigFile(
        ctx,
        stacksConfigRepository.templateEngine,
        logger,
        pathToConfigFile,
      )

      const externallyLoadedAccounts = await loadExternallyPersistedAccounts(
        ctx,
        logger,
        stacksConfigRepository.templateEngine,
        organizationDir,
        projectConfig,
      )

      const result = await buildOrganizationConfig(
        logger,
        ctx,
        externallyLoadedAccounts,
        parsedFile,
      )

      if (!result.isOk()) {
        const details = result.error.messages.map((m) => `- ${m}`).join("\n")
        throw new TakomoError(
          `Validation errors in organization configuration file ${pathToConfigFile}:\n${details}`,
        )
      }

      const organizationConfig = result.value

      const ouPaths = collectFromHierarchy(
        organizationConfig.organizationalUnits.Root,
        (n) => n.children,
      ).map((ou) => ou.path)

      const unknownOUs = Array.from(externallyLoadedAccounts.keys()).filter(
        (ou) => !ouPaths.includes(ou),
      )

      if (unknownOUs.length > 0) {
        throw new TakomoError(
          `Accounts loaded from account repository contain ${unknownOUs.length} organizational units that do not exists in organization configuration file:\n\n` +
            unknownOUs.map((ou) => `  - ${ou}`).join("\n"),
        )
      }

      return organizationConfig
    },

    putOrganizationConfig: async (
      config: OrganizationConfig,
    ): Promise<void> => {
      const { masterAccountId } = config

      const content = dedent`    
        masterAccountId: "${masterAccountId}"
        organizationalUnits:
          Root:
            accounts:
              - "${masterAccountId}"
        `

      if (!(await dirExists(organizationDir))) {
        try {
          await createDir(organizationDir)
        } catch (e) {
          logger.error(
            `Failed to create directory for the organization configuration file in path: ${organizationDir}`,
            e,
          )

          throw e
        }
      }

      const pathToConfigFile = path.join(
        organizationDir,
        defaultOrganizationConfigFileName,
      )

      if (await fileExists(pathToConfigFile)) {
        throw new TakomoError(
          `Takomo organization configuration file already exists in path: ${pathToConfigFile}`,
        )
      }

      try {
        await createFile(pathToConfigFile, content)
      } catch (e) {
        logger.error("Failed to create the organization configuration file", e)
        throw e
      }
    },

    getOrganizationPolicyContents: (
      policyType: OrganizationPolicyType,
      policyName: string,
    ): Promise<string> => {
      const policyFilePath = path.join(
        getOrganizationPolicyDir(policyType),
        `${policyName}.json`,
      )

      return readFileContents(policyFilePath)
    },
  }
}
