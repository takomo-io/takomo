import { Credentials } from "@aws-sdk/types"
import { build } from "esbuild"
import { Features } from "../../config/project-config"
import {
  InternalCommandContext,
  TakomoBuildInfo,
} from "../../context/command-context"
import { loadProjectConfig } from "../../parser/project-config-parser"
import { InternalAwsClientProvider } from "../../takomo-aws-clients"
import { OutputFormat } from "../../takomo-core/command"
import { fileExists, FilePath } from "../../utils/files"
import { LogLevel, TkmLogger } from "../../utils/logging"
import { VarFileOption } from "../../utils/variables"
import { createProjectFilePaths, ProjectFilePaths } from "../constants"
import { buildVariables } from "./build-variables"

export interface FileSystemCommandContext extends InternalCommandContext {
  readonly filePaths: ProjectFilePaths
}

export interface CreateFileSystemCommandContextProps {
  readonly quiet: boolean
  readonly resetCache: boolean
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
    resetCache,
    logger,
  } = props

  const filePaths = createProjectFilePaths(projectDir)

  const projectConfig = await loadProjectConfig(
    projectDir,
    filePaths.projectConfigFile,
    overrideFeatures,
  )

  logger.debugObject("Project config:", projectConfig)

  if (projectConfig.esbuild && projectConfig.esbuild.enabled) {
    if (await fileExists(projectConfig.esbuild.entryPoint)) {
      logger.debug(
        `Compile typescript project config file: ${projectConfig.esbuild.entryPoint}`,
      )

      await build({
        write: true,
        bundle: true,
        sourcemap: true,
        platform: "node",
        logLevel: "error",
        target: "node16.17.0",
        outfile: projectConfig.esbuild.outFile,
        entryPoints: [projectConfig.esbuild.entryPoint],
      })
    } else {
      logger.debug(
        `Takomo typescript project config file not found: ${projectConfig.esbuild.entryPoint}`,
      )
    }
  }

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
    resetCache,
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
