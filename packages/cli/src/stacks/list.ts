import { createListStacksIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import {
  listStacksCommand,
  listStacksCommandIamPolicy,
} from "@takomo/stacks-commands"
import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../common"
import { COMMAND_PATH_POSITIONAL } from "../constants"

export const listStacksCmd = {
  command: `list [${COMMAND_PATH_POSITIONAL}]`,
  desc: "List stack within the given command path",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(listStacksCommandIamPolicy))
      .positional(COMMAND_PATH_POSITIONAL, {
        describe: "List stacks within this path",
        default: ROOT_STACK_GROUP_PATH,
      }),
  handler: (argv: any) =>
    handle({
      argv,
      input: async (ctx, input) => ({
        ...input,
        commandPath: argv.commandPath,
      }),
      io: (ctx, logger) => createListStacksIO({ logger }),
      configRepository: (ctx, logger) =>
        createFileSystemStacksConfigRepository({
          ctx,
          logger,
          ...ctx.filePaths,
        }),
      executor: listStacksCommand,
    }),
}
