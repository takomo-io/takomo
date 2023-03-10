import { Credentials } from "@aws-sdk/types"
import { build } from "esbuild"
import { InternalAwsClientProvider } from "../../aws/aws-client-provider.js"
import { Features } from "../../config/project-config.js"
import {
  InternalCommandContext,
  TakomoBuildInfo,
} from "../../context/command-context.js"
import { loadProjectConfig } from "../../parser/project-config-parser.js"
import { OutputFormat } from "../../takomo-core/command.js"
import { fileExists, FilePath } from "../../utils/files.js"
import { LogLevel, TkmLogger } from "../../utils/logging.js"
import { VarFileOption } from "../../utils/variables.js"
import { createProjectFilePaths, ProjectFilePaths } from "../constants.js"
import { buildVariables } from "./build-variables.js"

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
        target: "node18.14.2",
        format: "esm",
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
