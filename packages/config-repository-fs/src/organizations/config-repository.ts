import { OrganizationPolicyType } from "@takomo/aws-model"
import {
  buildOrganizationConfig,
  OrganizationConfig,
} from "@takomo/organization-config"
import { OrganizationConfigRepository } from "@takomo/organization-context"
import {
  createDir,
  createFile,
  dirExists,
  fileExists,
  FilePath,
  readFileContents,
  TakomoError,
} from "@takomo/util"
import path from "path"
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

      const result = await buildOrganizationConfig(logger, ctx, parsedFile)

      if (result.isOk()) {
        return result.value
      }

      const details = result.error.messages.map((m) => `- ${m}`).join("\n")
      throw new TakomoError(
        `Validation errors in organization configuration file ${pathToConfigFile}:\n${details}`,
      )
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
