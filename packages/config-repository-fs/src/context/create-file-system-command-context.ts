import { Credentials } from "@aws-sdk/types"
import { InternalAwsClientProvider } from "@takomo/aws-clients"
import {
  Features,
  InternalCommandContext,
  OutputFormat,
  TakomoBuildInfo,
} from "@takomo/core"
import { FilePath, LogLevel, TkmLogger, VarFileOption } from "@takomo/util"
import { createProjectFilePaths, ProjectFilePaths } from "../constants"
import { loadProjectConfig } from "../project/config"
import { buildVariables } from "./build-variables"

export interface FileSystemCommandContext extends InternalCommandContext {
  readonly filePaths: ProjectFilePaths
}

export interface CreateFileSystemCommandContextProps {
  readonly quiet: boolean
  readonly outputFormat: OutputFormat
  readonly logLevel: LogLevel
  readonly autoConfirmEnabled: boolean
  readonly statisticsEnabled: boolean
  readonly iamGeneratePoliciesInstructionsEnabled: boolean
  readonly confidentialValuesLoggingEnabled: boolean
  readonly buildInfo: TakomoBuildInfo
  readonly projectDir: FilePath
  readonly awsClientProvider: InternalAwsClientProvider
  readonly overrideFeatures: Partial<Features>
  readonly credentials?: Credentials
  readonly vars: Record<string, any>
  readonly varFilePaths: ReadonlyArray<VarFileOption>
  readonly envFilePaths: ReadonlyArray<FilePath>
  readonly logger: TkmLogger
}

export const createFileSystemCommandContext = async (
  props: CreateFileSystemCommandContextProps,
): Promise<FileSystemCommandContext> => {
  const {
    quiet,
    outputFormat,
    logLevel,
    autoConfirmEnabled,
    statisticsEnabled,
    confidentialValuesLoggingEnabled,
    iamGeneratePoliciesInstructionsEnabled,
    credentials,
    buildInfo,
    projectDir,
    awsClientProvider,
    overrideFeatures,
    vars,
    varFilePaths,
    envFilePaths,
  } = props

  const filePaths = createProjectFilePaths(projectDir)

  const projectConfig = await loadProjectConfig(
    projectDir,
    filePaths.projectConfigFile,
    overrideFeatures,
  )

  const regions = projectConfig.regions.slice()

  const projectVarFilePaths = projectConfig.varFiles.map((filePath) => ({
    filePath,
  }))

  const allVarFilePaths = [...projectVarFilePaths, ...varFilePaths]

  const variables = await buildVariables(
    projectDir,
    allVarFilePaths,
    vars,
    envFilePaths,
  )

  return {
    variables,
    projectDir,
    quiet,
    outputFormat,
    logLevel,
    autoConfirmEnabled,
    statisticsEnabled,
    iamGeneratePoliciesInstructionsEnabled,
    confidentialValuesLoggingEnabled,
    credentials,
    buildInfo,
    awsClientProvider,
    projectConfig,
    regions,
    filePaths,
  }
}
