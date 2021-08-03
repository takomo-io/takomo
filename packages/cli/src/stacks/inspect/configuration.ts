import { createShowConfigurationIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import { showConfigurationCommand } from "@takomo/stacks-commands"
import { CommandPath, ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { Arguments, Argv, CommandModule } from "yargs"
import { handle, RunProps } from "../../common"
import {
  COMMAND_PATH_OPT,
  INTERACTIVE_ALIAS_OPT,
  INTERACTIVE_OPT,
  OUTPUT_OPT,
} from "../../constants"

type CommandArgs = {
  readonly [COMMAND_PATH_OPT]: CommandPath
  readonly [INTERACTIVE_OPT]: boolean
}

const command = `configuration [${COMMAND_PATH_OPT}]`
const describe = "Show configuration of stacks within the given command path"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .positional(COMMAND_PATH_OPT, {
      describe: "Show configuration within this path",
      default: ROOT_STACK_GROUP_PATH,
    })
    .option(OUTPUT_OPT, {
      description: "Output format",
      choices: ["text", "json", "yaml"],
      default: "text",
      string: true,
      global: false,
      demandOption: false,
    })
    .option(INTERACTIVE_OPT, {
      alias: INTERACTIVE_ALIAS_OPT,
      description: "Interactive selecting of command path",
      boolean: true,
      global: false,
      default: false,
      demandOption: false,
    })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    io: (ctx, logger) => createShowConfigurationIO({ logger }),
    input: async (ctx, input) => ({
      ...input,
      commandPath: argv[COMMAND_PATH_OPT],
      interactive: argv.interactive,
    }),
    configRepository: (ctx, logger) =>
      createFileSystemStacksConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: showConfigurationCommand,
  })

export const configurationCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
