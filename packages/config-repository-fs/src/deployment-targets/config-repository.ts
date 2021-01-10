import {
  buildDeploymentConfig,
  DeploymentConfig,
} from "@takomo/deployment-targets-config"
import { DeploymentTargetsConfigRepository } from "@takomo/deployment-targets-context"
import { dirExists, FilePath, TakomoError } from "@takomo/util"
import { basename, join } from "path"
import {
  createFileSystemStacksConfigRepository,
  FileSystemStacksConfigRepositoryProps,
} from "../stacks/config-repository"
import { parseConfigFile } from "./parser"

interface FileSystemDeploymentTargetsConfigRepositoryProps
  extends FileSystemStacksConfigRepositoryProps {
  readonly pathToDeploymentConfigFile?: FilePath
  readonly deploymentDir: FilePath
  readonly defaultDeploymentConfigFileName: string
}

const resolveConfigFilePath = (
  deploymentDir: FilePath,
  pathToConfigFile: FilePath,
): FilePath =>
  pathToConfigFile.startsWith("/")
    ? pathToConfigFile
    : join(deploymentDir, pathToConfigFile)

export const createFileSystemDeploymentTargetsConfigRepository = async (
  props: FileSystemDeploymentTargetsConfigRepositoryProps,
): Promise<DeploymentTargetsConfigRepository> => {
  const stacksConfigRepository = await createFileSystemStacksConfigRepository(
    props,
  )

  const {
    projectDir,
    defaultDeploymentConfigFileName,
    deploymentDir,
    pathToDeploymentConfigFile,
    logger,
    ctx,
  } = props

  return {
    ...stacksConfigRepository,
    loadDeploymentConfigFileContents: async (): Promise<DeploymentConfig> => {
      if (!(await dirExists(deploymentDir))) {
        throw new TakomoError(
          `Takomo deployment dir '${basename(
            deploymentDir,
          )}' not found from the project dir ${projectDir}`,
        )
      }

      const configFile = pathToDeploymentConfigFile
        ? resolveConfigFilePath(deploymentDir, pathToDeploymentConfigFile)
        : join(deploymentDir, defaultDeploymentConfigFileName)

      const parsedFile = await parseConfigFile(
        ctx,
        logger,
        stacksConfigRepository.templateEngine,
        configFile,
      )

      const result = buildDeploymentConfig(ctx, parsedFile)
      if (result.isOk()) {
        return result.value
      }

      const details = result.error.messages.map((m) => `- ${m}`).join("\n")
      throw new TakomoError(
        `Validation errors in deployment targets configuration file ${configFile}:\n${details}`,
      )
    },
  }
}
