import {
  OrganizationPolicyName,
  OrganizationPolicyType,
} from "@takomo/aws-model"
import { ConfigSetName } from "@takomo/config-sets"
import { CommandContext } from "@takomo/core"
import {
  AccountConfigItem,
  AccountRepository,
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
import { StacksConfigRepository } from "@takomo/stacks-context"
import {
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
import path, { join } from "path"
import R from "ramda"
import dedent from "ts-dedent"
import { loadConfigSetsFromConfigSetsDir } from "../config-sets/config-sets-loader"
import {
  createFileSystemStacksConfigRepository,
  FileSystemStacksConfigRepositoryProps,
} from "../stacks/config-repository"
import { parseOrganizationConfigFile } from "./parser"

interface FileSystemOrganizationConfigRepositoryProps
  extends FileSystemStacksConfigRepositoryProps {
  readonly organizationDir: FilePath
  readonly configSetsDir: FilePath
  readonly organizationTagPoliciesDir: FilePath
  readonly organizationBackupPoliciesDir: FilePath
  readonly organizationServiceControlPoliciesDir: FilePath
  readonly organizationAiServicesOptOutPoliciesDir: FilePath
  readonly defaultOrganizationConfigFileName: string
}

const initAccountRepository = async (
  ctx: CommandContext,
  logger: TkmLogger,
  templateEngine: TemplateEngine,
): Promise<AccountRepository | undefined> => {
  if (ctx.projectConfig?.organization?.repository === undefined) {
    return undefined
  }

  const registry = createAccountRepositoryRegistry()
  registry.registerAccountRepositoryProvider(
    "filesystem",
    createFileSystemAccountRepositoryProvider(),
  )

  return registry.initAccountRepository({
    logger,
    ctx,
    templateEngine,
    config: ctx.projectConfig.organization.repository,
  })
}

const loadExternallyPersistedAccounts = async (
  ctx: CommandContext,
  logger: TkmLogger,
  templateEngine: TemplateEngine,
): Promise<Map<OrganizationalUnitPath, ReadonlyArray<unknown>>> => {
  const repository = await initAccountRepository(ctx, logger, templateEngine)

  if (!repository) {
    return new Map()
  }

  const accounts = await repository.listAccounts()

  const schema = createAccountConfigItemSchema({
    regions: ctx.regions,
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

  return new Map(
    Array.from(
      Object.entries(
        R.groupBy(
          (a) => a.organizationalUnitPath,
          accounts.map((w) => w.item),
        ),
      ),
    ),
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
    configSetsDir,
    stacksDir,
    organizationTagPoliciesDir,
    organizationBackupPoliciesDir,
    organizationServiceControlPoliciesDir,
    organizationAiServicesOptOutPoliciesDir,
    defaultOrganizationConfigFileName,
    ctx,
    logger,
  } = props

  const pathToOrganizationConfigFile = path.join(
    organizationDir,
    defaultOrganizationConfigFileName,
  )

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

  const loadOrganizationConfig = async (): Promise<Record<string, unknown>> => {
    if (!(await fileExists(pathToOrganizationConfigFile))) {
      throw new TakomoError(
        `Takomo organization configuration file not found from path: ${pathToOrganizationConfigFile}`,
      )
    }

    return parseOrganizationConfigFile(
      ctx,
      stacksConfigRepository.templateEngine,
      logger,
      pathToOrganizationConfigFile,
    )
  }

  const getOrganizationConfig = async (): Promise<OrganizationConfig> => {
    const record = await loadOrganizationConfig()

    const externallyLoadedAccounts = await loadExternallyPersistedAccounts(
      ctx,
      logger,
      stacksConfigRepository.templateEngine,
    )

    const externalConfigSets = await loadConfigSetsFromConfigSetsDir(
      configSetsDir,
    )

    const result = await buildOrganizationConfig({
      logger,
      ctx,
      externallyLoadedAccounts,
      externalConfigSets,
      record,
    })

    if (!result.isOk()) {
      const details = result.error.messages.map((m) => `  - ${m}`).join("\n")
      throw new TakomoError(
        `Validation errors in organization configuration file ${pathToOrganizationConfigFile}:\n\n${details}`,
      )
    }

    return result.value
  }

  const putOrganizationConfig = async (
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
  }

  const getOrganizationPolicyContents = (
    policyType: OrganizationPolicyType,
    policyName: OrganizationPolicyName,
  ): Promise<string> => {
    const policyFilePath = path.join(
      getOrganizationPolicyDir(policyType),
      `${policyName}.json`,
    )

    return readFileContents(policyFilePath)
  }

  const putAccountConfig = async (item: AccountConfigItem): Promise<void> => {
    logger.debug(`About to persist account '${item.id}' configuration`)
    const repository = await initAccountRepository(
      ctx,
      logger,
      stacksConfigRepository.templateEngine,
    )

    if (!repository) {
      logger.debug(`Account repository not configured, skip persisting`)
      return
    }

    await repository.putAccount(item)
  }

  const createStacksConfigRepository = async (
    configSetName: ConfigSetName,
    legacy: boolean,
  ): Promise<StacksConfigRepository> => {
    const configSetStacksDir = legacy
      ? stacksDir
      : join(configSetsDir, configSetName)

    if (!(await dirExists(configSetStacksDir))) {
      throw new Error(`Config set directory not found: ${configSetStacksDir}`)
    }

    return createFileSystemStacksConfigRepository({
      ...props,
      stacksDir: configSetStacksDir,
    })
  }

  return {
    ...stacksConfigRepository,
    createStacksConfigRepository,
    getOrganizationConfig,
    putOrganizationConfig,
    getOrganizationPolicyContents,
    putAccountConfig,
  }
}
