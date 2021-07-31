import { createListStacksIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import {
  listStacksCommand,
  listStacksCommandIamPolicy,
} from "@takomo/stacks-commands"
import { CommandPath, ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle } from "../common"
import { COMMAND_PATH_OPT } from "../constants"

type CommandArgs = {
  readonly [COMMAND_PATH_OPT]: CommandPath
}

const command = `list [${COMMAND_PATH_OPT}]`
const describe = "List stack within the given command path"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(listStacksCommandIamPolicy))
    .positional(COMMAND_PATH_OPT, {
      describe: "List stacks within this path",
      type: "string",
      default: ROOT_STACK_GROUP_PATH,
    })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      commandPath: argv[COMMAND_PATH_OPT],
    }),
    io: (ctx, logger) => createListStacksIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemStacksConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: listStacksCommand,
  })

export const listStacksCmd: CommandModule<CommandArgs, CommandArgs> = {
  command,
  describe,
  builder,
  handler,
}
