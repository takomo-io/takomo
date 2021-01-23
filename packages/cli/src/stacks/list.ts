import { createListStacksIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import {
  listStacksCommand,
  listStacksCommandIamPolicy,
} from "@takomo/stacks-commands"
import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../common"

export const listStacksCmd = {
  command: "list [commandPath]",
  desc: "List stack within the given command path",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(listStacksCommandIamPolicy))
      .positional("commandPath", {
        describe: "List stacks within this path",
        default: ROOT_STACK_GROUP_PATH,
      }),
  handler: (argv: any) =>
    handle({
      argv,
      input: (ctx, input) => ({
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
