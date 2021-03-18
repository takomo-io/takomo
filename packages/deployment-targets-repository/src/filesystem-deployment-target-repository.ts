import {
  createFile,
  deepFreeze,
  dirExists,
  expandFilePath,
  FilePath,
  formatYaml,
  parseYaml,
  readFileContents,
  renderTemplate,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import { join } from "path"
import readdirp from "readdirp"
import {
  DeploymentTargetConfigItem,
  DeploymentTargetConfigItemWrapper,
  DeploymentTargetRepository,
  DeploymentTargetRepositoryProvider,
} from "./deployment-target-repository"

const loadDeploymentTargetFile = async (
  templateEngine: TemplateEngine,
  variables: any,
  pathToFile: FilePath,
): Promise<DeploymentTargetConfigItemWrapper> => {
  const contents = await readFileContents(pathToFile)
  const rendered = await renderTemplate(
    templateEngine,
    pathToFile,
    contents,
    variables,
  )

  const item = (await parseYaml(
    pathToFile,
    rendered,
  )) as DeploymentTargetConfigItem
  return {
    item,
    source: pathToFile,
  }
}

export const createFileSystemDeploymentTargetRepositoryProvider = (): DeploymentTargetRepositoryProvider => {
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

      const expandedDir = expandFilePath(ctx.projectDir, deploymentTargetsDir)

      if (!(await dirExists(expandedDir))) {
        throw new TakomoError(
          `Invalid deployment target repository config - directory '${expandedDir}' given in 'dir' property does not exist`,
        )
      }

      logger.debug(`Load deployment targets from dir: ${expandedDir}`)

      const deploymentTargetFiles = await readdirp.promise(expandedDir, {
        alwaysStat: true,
        depth: 100,
        type: "files",
        fileFilter: (e) => e.basename.endsWith(".yml"),
      })

      const deploymentTargets = await Promise.all(
        deploymentTargetFiles.map((f) =>
          loadDeploymentTargetFile(templateEngine, ctx.variables, f.fullPath),
        ),
      )

      logger.debug(
        `Loaded ${deploymentTargets.length} deployment targets from dir: ${expandedDir}`,
      )

      return {
        putDeploymentTarget: async (
          item: DeploymentTargetConfigItem,
        ): Promise<void> => {
          const pathToFile = join(expandedDir, `${item.name}.yml`)
          logger.info(`Persist account '${item.name}' to file: ${pathToFile}`)
          const contents = formatYaml(item)
          logger.trace("File contents:", () => contents)
          await createFile(pathToFile, contents)
        },
        listDeploymentTargets: async (): Promise<
          ReadonlyArray<DeploymentTargetConfigItemWrapper>
        > => deepFreeze(deploymentTargets),
      }
    },
  }
}
