import { basename, dirname, relative } from "path"
import { readdirpPromise } from "readdirp"

import {
  DeploymentGroupPath,
  DeploymentTargetName,
} from "../targets/targets-model.js"
import { TemplateEngine } from "../templating/template-engine.js"
import { TakomoError } from "../utils/errors.js"
import { dirExists, expandFilePath, FilePath } from "../utils/files.js"
import { TkmLogger } from "../utils/logging.js"
import { parseYaml } from "../utils/yaml.js"
import {
  DeploymentTargetConfigItem,
  DeploymentTargetConfigItemWrapper,
  DeploymentTargetRepository,
  DeploymentTargetRepositoryProvider,
} from "./deployment-target-repository.js"
import { InvalidDeploymentTargetFileLocationError } from "./errors.js"

interface LoadDeploymentTargetFileProps {
  readonly templateEngine: TemplateEngine
  readonly variables: unknown
  readonly baseDir: FilePath
  readonly pathToFile: FilePath
  readonly inferDeploymentGroupPathFromDirName: boolean
  readonly inferDeploymentTargetNameFromFileName: boolean
  readonly logger: TkmLogger
}

export const inferDeploymentGroupPathFromFilePath = (
  baseDir: FilePath,
  pathToFile: FilePath,
): DeploymentGroupPath => {
  const parentDir = dirname(pathToFile)
  if (parentDir === baseDir) {
    throw new InvalidDeploymentTargetFileLocationError(pathToFile, baseDir)
  }

  return relative(baseDir, parentDir)
}

const resolveDeploymentGroupPath = (
  item: DeploymentTargetConfigItem,
  {
    inferDeploymentGroupPathFromDirName,
    baseDir,
    pathToFile,
  }: LoadDeploymentTargetFileProps,
): DeploymentGroupPath =>
  inferDeploymentGroupPathFromDirName
    ? inferDeploymentGroupPathFromFilePath(baseDir, pathToFile)
    : item.deploymentGroupPath

export const inferDeploymentTargetName = (
  pathToFile: FilePath,
): DeploymentTargetName => basename(pathToFile, ".yml")

const resolveDeploymentTargetName = (
  item: DeploymentTargetConfigItem,
  {
    inferDeploymentTargetNameFromFileName,
    pathToFile,
  }: LoadDeploymentTargetFileProps,
): DeploymentTargetName =>
  inferDeploymentTargetNameFromFileName
    ? inferDeploymentTargetName(pathToFile)
    : item.name

const loadDeploymentTargetFile = async (
  props: LoadDeploymentTargetFileProps,
): Promise<DeploymentTargetConfigItemWrapper> => {
  const { templateEngine, variables, pathToFile } = props

  const rendered = await templateEngine.renderTemplateFile({
    pathToFile,
    variables,
  })

  const item = (await parseYaml(
    pathToFile,
    rendered,
  )) as DeploymentTargetConfigItem

  const deploymentGroupPath = resolveDeploymentGroupPath(item, props)
  const name = resolveDeploymentTargetName(item, props)

  return {
    item: {
      ...item,
      name,
      deploymentGroupPath,
    },
    source: pathToFile,
  }
}

export const createFileSystemDeploymentTargetRepositoryProvider =
  (): DeploymentTargetRepositoryProvider => {
    return {
      initDeploymentTargetRepository: async ({
        templateEngine,
        logger,
        ctx,
        config,
      }): Promise<DeploymentTargetRepository> => {
        if (config.dir === undefined || config.dir === null) {
          throw new TakomoError(
            "Invalid deployment target repository config - 'dir' property not found",
          )
        }

        const deploymentTargetsDir = config.dir
        if (typeof deploymentTargetsDir !== "string") {
          throw new TakomoError(
            "Invalid deployment target repository config - 'dir' property must be of type 'string'",
          )
        }

        const inferDeploymentGroupPathFromDirName =
          config.inferDeploymentGroupPathFromDirName ?? false
        if (typeof inferDeploymentGroupPathFromDirName !== "boolean") {
          throw new TakomoError(
            "Invalid deployment target repository config - 'inferDeploymentGroupPathFromDirName' property must be of type 'boolean'",
          )
        }

        const inferDeploymentTargetNameFromFileName =
          config.inferDeploymentTargetNameFromFileName ?? false
        if (typeof inferDeploymentTargetNameFromFileName !== "boolean") {
          throw new TakomoError(
            "Invalid deployment target repository config - 'inferDeploymentTargetNameFromFileName' property must be of type 'boolean'",
          )
        }

        const expandedDir = expandFilePath(ctx.projectDir, deploymentTargetsDir)

        if (!(await dirExists(expandedDir))) {
          throw new TakomoError(
            `Invalid deployment target repository config - directory '${expandedDir}' given in 'dir' property does not exist`,
          )
        }

        logger.debug(`Load deployment targets from dir: ${expandedDir}`)

        const deploymentTargetFiles = await readdirpPromise(expandedDir, {
          alwaysStat: true,
          depth: 100,
          type: "files",
          fileFilter: (e) => e.basename.endsWith(".yml"),
        })

        const deploymentTargets = await Promise.all(
          deploymentTargetFiles.map((f) =>
            loadDeploymentTargetFile({
              logger,
              templateEngine,
              inferDeploymentGroupPathFromDirName,
              inferDeploymentTargetNameFromFileName,
              variables: ctx.variables,
              baseDir: expandedDir,
              pathToFile: f.fullPath,
            }),
          ),
        )

        logger.debug(
          `Loaded ${deploymentTargets.length} deployment targets from dir: ${expandedDir}`,
        )

        return {
          listDeploymentTargets: async (): Promise<
            ReadonlyArray<DeploymentTargetConfigItemWrapper>
          > => deploymentTargets,
        }
      },
    }
  }
