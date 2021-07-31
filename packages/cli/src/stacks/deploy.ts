import { createDeployStacksIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import {
  deployStacksCommand,
  deployStacksCommandIamPolicy,
} from "@takomo/stacks-commands"
import { CommandPath, ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle } from "../common"
import {
  COMMAND_PATH_OPT,
  IGNORE_DEPENDENCIES_OPT,
  INTERACTIVE_ALIAS_OPT,
  INTERACTIVE_OPT,
} from "../constants"

type CommandArgs = {
  readonly [COMMAND_PATH_OPT]: CommandPath
  readonly [IGNORE_DEPENDENCIES_OPT]: boolean
  readonly [INTERACTIVE_OPT]: boolean
}

const command = `deploy [${COMMAND_PATH_OPT}]`
const describe = "Deploy stacks within the given command path"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(deployStacksCommandIamPolicy))
    .example("$0 deploy /networking", "Deploy stacks within /networking path")
    .example(
      "$0 deploy /networking/vpc.yml",
      "Deploy only the /networking/vpc.yml stack",
    )
    .option(IGNORE_DEPENDENCIES_OPT, {
      description: "Ignore stack dependencies",
      type: "boolean",
      global: false,
      default: false,
      demandOption: false,
    })
    .option(INTERACTIVE_OPT, {
      alias: INTERACTIVE_ALIAS_OPT,
      description: "Interactive selecting of command path",
      type: "boolean",
      global: false,
      default: false,
      demandOption: false,
    })
    .positional(COMMAND_PATH_OPT, {
      describe: "Deploy stacks within this path",
      type: "string",
      default: ROOT_STACK_GROUP_PATH,
    })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      ignoreDependencies: argv[IGNORE_DEPENDENCIES_OPT],
      commandPath: argv[COMMAND_PATH_OPT],
      interactive: argv.interactive,
    }),
    io: (ctx, logger) => createDeployStacksIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemStacksConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: deployStacksCommand,
  })

export const deployStacksCmd: CommandModule<CommandArgs, CommandArgs> = {
  command,
  describe,
  builder,
  handler,
}
