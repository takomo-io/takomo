import { createDependencyGraphIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import { dependencyGraphCommand } from "@takomo/stacks-commands"
import { CommandPath, ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { Arguments, Argv, CommandModule } from "yargs"
import { handle } from "../../common"
import { COMMAND_PATH_OPT } from "../../constants"

type CommandArgs = {
  readonly [COMMAND_PATH_OPT]: CommandPath
}

const command = `dependency-graph [${COMMAND_PATH_OPT}]`
const describe = "Show dependency graph of stacks within the given command path"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.positional(COMMAND_PATH_OPT, {
    describe: "Show dependency graph within this path",
    type: "string",
    default: ROOT_STACK_GROUP_PATH,
  })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    io: (ctx, logger) => createDependencyGraphIO({ logger }),
    input: async (ctx, input) => ({
      ...input,
      commandPath: argv[COMMAND_PATH_OPT],
    }),
    configRepository: (ctx, logger) =>
      createFileSystemStacksConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: dependencyGraphCommand,
  })

export const dependencyGraphCmd: CommandModule<CommandArgs, CommandArgs> = {
  command,
  describe,
  builder,
  handler,
}
