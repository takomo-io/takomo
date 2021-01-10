import { CommandContext } from "@takomo/core"
import { FilePath } from "@takomo/util"

export interface ProjectFilePaths {
  readonly projectDir: FilePath
  readonly stacksDir: FilePath
  readonly templatesDir: FilePath
  readonly partialsDir: FilePath
  readonly hooksDir: FilePath
  readonly resolversDir: FilePath
  readonly helpersDir: FilePath
  readonly projectConfigFile: FilePath
  readonly stackGroupConfigFileName: string
  readonly projectConfigFileName: string
  readonly configFileExtension: string
  readonly defaultDeploymentConfigFileName: string
  readonly deploymentDir: FilePath
  readonly organizationDir: FilePath
  readonly organizationTagPoliciesDir: FilePath
  readonly organizationBackupPoliciesDir: FilePath
  readonly organizationServiceControlPoliciesDir: FilePath
  readonly organizationAiServicesOptOutPoliciesDir: FilePath
  readonly defaultOrganizationConfigFileName: string
}

export interface CliCommandContext extends CommandContext {
  readonly filePaths: ProjectFilePaths
}
