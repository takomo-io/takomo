import { Arguments, Argv, CommandModule } from "yargs"
import { CommandPath } from "../../command/command-model"
import { listStacksCommand } from "../../command/stacks/list/command"
import { listStacksCommandIamPolicy } from "../../command/stacks/list/iam-policy"
import { createListStacksIO } from "../../takomo-cli-io"
import { createFileSystemStacksConfigRepository } from "../../takomo-config-repository-fs"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants"
import { commonEpilog, handle, RunProps } from "../common"
import { COMMAND_PATH_OPT, outputFormatOptions } from "../constants"

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
