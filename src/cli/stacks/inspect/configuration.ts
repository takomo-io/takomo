import { Arguments, Argv, CommandModule } from "yargs"
import { createShowConfigurationIO } from "../../../cli-io/stacks/inspect/show-configuration-io.js"
import { CommandPath } from "../../../command/command-model.js"
import { showConfigurationCommand } from "../../../command/stacks/inspect/configuration/command.js"
import { createFileSystemStacksConfigRepository } from "../../../takomo-config-repository-fs/stacks/config-repository.js"
import { ROOT_STACK_GROUP_PATH } from "../../../takomo-stacks-model/constants.js"
import { handle, RunProps } from "../../common.js"
import {
  COMMAND_PATH_OPT,
  INTERACTIVE_OPT,
  outputFormatOptions,
} from "../../constants.js"
import { interactiveCommandPathSelectionOptions } from "../common.js"

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
    .options({
      ...interactiveCommandPathSelectionOptions,
      ...outputFormatOptions,
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
