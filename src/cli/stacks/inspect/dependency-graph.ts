import { Arguments, Argv, CommandModule } from "yargs"
import { createDependencyGraphIO } from "../../../cli-io/index.js"
import { CommandPath } from "../../../command/command-model.js"
import { dependencyGraphCommand } from "../../../command/stacks/inspect/dependency-graph/command.js"
import { createFileSystemStacksConfigRepository } from "../../../takomo-config-repository-fs/stacks/config-repository.js"
import { ROOT_STACK_GROUP_PATH } from "../../../takomo-stacks-model/constants.js"
import { handle, RunProps } from "../../common.js"
import { COMMAND_PATH_OPT } from "../../constants.js"

type CommandArgs = {
  readonly [COMMAND_PATH_OPT]: CommandPath
}

const command = `dependency-graph [${COMMAND_PATH_OPT}]`
const describe = "Show dependency graph of stacks within the given command path"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.positional(COMMAND_PATH_OPT, {
    describe: "Show dependency graph within this path",
    string: true,
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

export const dependencyGraphCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
