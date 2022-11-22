import path from "path"
import readdirp from "readdirp"
import { FilePath } from "../../../src/utils/files"
import { createStacksSchemas } from "../../schema/stacks-schema"
import { CommandContext } from "../../takomo-core"
import { StackGroupConfigNode } from "../../takomo-stacks-context"
import {
  ROOT_STACK_GROUP_PATH,
  StackGroupPath,
} from "../../takomo-stacks-model"
import { TkmLogger } from "../../utils/logging"
import { TemplateEngine } from "../../utils/templating"
import { validate } from "../../utils/validation"
import { parseStackConfigFile, parseStackGroupConfigFile } from "./parser"

export const buildStackGroupConfigNode = async (
  ctx: CommandContext,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  configFileExtension: string,
  stackGroupConfigFileName: string,
  stackGroupDir: FilePath,
  stackGroupPath: StackGroupPath,
  parentStackGroupPath?: StackGroupPath,
): Promise<StackGroupConfigNode> => {
  logger.debug(
    `Process stack group ${stackGroupPath} from dir: ${stackGroupDir}`,
  )

  const { stackGroupName } = createStacksSchemas({ regions: ctx.regions })

  validate(
    stackGroupName,
    path.basename(stackGroupDir),
    `Directory ${stackGroupDir} name is not suitable for a stack group`,
  )
  const files = await readdirp.promise(stackGroupDir, {
    alwaysStat: true,
    depth: 0,
    fileFilter: (e) => e.basename.endsWith(configFileExtension),
    type: "files_directories",
  })

  const childStackGroupDirs = files.filter((f) => f.stats!.isDirectory())
  const children = await Promise.all(
    childStackGroupDirs.map((d) => {
      const childPath =
        stackGroupPath === ROOT_STACK_GROUP_PATH
          ? `/${d.basename}`
          : `${stackGroupPath}/${d.basename}`
      return buildStackGroupConfigNode(
        ctx,
        templateEngine,
        logger,
        configFileExtension,
        stackGroupConfigFileName,
        d.fullPath,
        childPath,
        stackGroupPath,
      )
    }),
  )

  const stacks = files
    .filter((f) => f.stats!.isFile() && f.basename !== stackGroupConfigFileName)
    .map((f) => ({
      path:
        stackGroupPath === ROOT_STACK_GROUP_PATH
          ? `/${f.basename}`
          : `${stackGroupPath}/${f.basename}`,
      getConfig: (variables: any) =>
        parseStackConfigFile(
          ctx,
          variables,
          templateEngine,
          logger,
          f.fullPath,
        ),
    }))

  const file = files.find((f) => f.basename === stackGroupConfigFileName)

  if (file) {
    logger.debug(`Found stack group config file: ${file.fullPath}`)
  }

  return {
    name: path.basename(stackGroupDir),
    path: stackGroupPath,
    parentPath: parentStackGroupPath,
    stacks,
    children,
    getConfig: async (variables: any) =>
      file
        ? parseStackGroupConfigFile(
            ctx,
            variables,
            templateEngine,
            logger,
            file.fullPath,
          )
        : undefined,
  }
}
