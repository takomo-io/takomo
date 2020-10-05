import { Constants, stackGroupName, StackGroupPath } from "@takomo/core"
import { FilePath, Logger, validate } from "@takomo/util"
import * as path from "path"
import readdirp from "readdirp"
import { ConfigTree } from "./config-tree"
import { StackGroupConfigNode } from "./stack-group-config-node"

const buildStackGroupConfigNode = async (
  logger: Logger,
  stackGroupDir: FilePath,
  stackGroupPath: StackGroupPath,
  parentStackGroupPath?: StackGroupPath,
): Promise<StackGroupConfigNode> => {
  logger.debug(
    `Process stack group ${stackGroupPath} from dir: ${stackGroupDir}`,
  )
  validate(
    stackGroupName,
    path.basename(stackGroupDir),
    `Directory ${stackGroupDir} name is not suitable for a stack group`,
  )
  const files = await readdirp.promise(stackGroupDir, {
    alwaysStat: true,
    depth: 0,
    fileFilter: (e) => e.basename.endsWith(Constants.CONFIG_FILE_EXTENSION),
    type: "files_directories",
  })

  const childStackGroupDirs = files.filter((f) => f.stats!.isDirectory())
  const children = await Promise.all(
    childStackGroupDirs.map((d) => {
      const childPath =
        stackGroupPath === Constants.ROOT_STACK_GROUP_PATH
          ? `/${d.basename}`
          : `${stackGroupPath}/${d.basename}`
      return buildStackGroupConfigNode(
        logger,
        d.fullPath,
        childPath,
        stackGroupPath,
      )
    }),
  )

  const stacks = files
    .filter(
      (f) =>
        f.stats!.isFile() && f.basename !== Constants.STACK_GROUP_CONFIG_FILE,
    )
    .map((f) => ({
      file: { fullPath: f.fullPath, basename: f.basename },
      path:
        stackGroupPath === Constants.ROOT_STACK_GROUP_PATH
          ? `/${f.basename}`
          : `${stackGroupPath}/${f.basename}`,
    }))

  stacks.forEach((stack) =>
    logger.debug(`Found stack config file: ${stack.file.fullPath}`),
  )

  const file = files.find(
    (f) => f.basename === Constants.STACK_GROUP_CONFIG_FILE,
  )

  if (file) {
    logger.debug(`Found stack group config file: ${file.fullPath}`)
  }

  return {
    dir: { fullPath: stackGroupDir, basename: path.basename(stackGroupDir) },
    file: file
      ? { fullPath: file.fullPath, basename: file.basename }
      : undefined,
    path: stackGroupPath,
    parentPath: parentStackGroupPath,
    stacks,
    children,
  }
}

export const buildConfigTree = async (
  logger: Logger,
  stackGroupDir: FilePath,
  stackGroupPath: StackGroupPath,
): Promise<ConfigTree> =>
  buildStackGroupConfigNode(
    logger,
    stackGroupDir,
    stackGroupPath,
  ).then((rootStackGroup) => ({ rootStackGroup }))
