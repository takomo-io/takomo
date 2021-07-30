import { createShowConfigurationIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import { showConfigurationCommand } from "@takomo/stacks-commands"
import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { handle } from "../../common"
import {
  INTERACTIVE_ALIAS_OPT,
  INTERACTIVE_OPT,
  OUTPUT_OPT,
} from "../../constants"

const command = "configuration [commandPath]"
const desc = "Show configuration of stacks within the given command path"

const builder = (yargs: any) =>
  yargs
    .positional("commandPath", {
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

const handler = (argv: any) =>
  handle({
    argv,
    io: (ctx, logger) => createShowConfigurationIO({ logger }),
    input: async (ctx, input) => ({
      ...input,
      commandPath: argv.commandPath,
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

export const configurationCmd = {
  command,
  desc,
  builder,
  handler,
}
