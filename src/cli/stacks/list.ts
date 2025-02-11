import { Arguments, Argv, CommandModule } from "yargs"
import { createListStacksIO } from "../../cli-io/stacks/list-stacks-io.js"
import { CommandPath } from "../../command/command-model.js"
import { listStacksCommand } from "../../command/stacks/list/command.js"
import { listStacksCommandIamPolicy } from "../../command/stacks/list/iam-policy.js"
import { createFileSystemStacksConfigRepository } from "../../takomo-config-repository-fs/stacks/config-repository.js"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants.js"
import { commonEpilog, handle, RunProps } from "../common.js"
import { COMMAND_PATH_OPT, outputFormatOptions } from "../constants.js"

type CommandArgs = {
  readonly [COMMAND_PATH_OPT]: CommandPath
}

const command = `list [${COMMAND_PATH_OPT}]`
const describe = "List stack within the given command path"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(listStacksCommandIamPolicy))
    .options(outputFormatOptions)
    .positional(COMMAND_PATH_OPT, {
      describe: "List stacks within this path",
      string: true,
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

export const listStacksCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
