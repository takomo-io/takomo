import path from "path"
import { readdirpPromise } from "readdirp"
import { CommandContext } from "../../context/command-context.js"
import { createStacksSchemas } from "../../schema/stacks-schema.js"
import { StackGroupPath } from "../../stacks/stack-group.js"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants.js"
import { TemplateEngine } from "../../templating/template-engine.js"
import { FilePath } from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import { validate } from "../../utils/validation.js"
import { parseStackConfigFile, parseStackGroupConfigFile } from "./parser.js"
import { StackGroupConfigNode } from "../../takomo-stacks-context/config/config-tree.js"

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
  const files = await readdirpPromise(stackGroupDir, {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
