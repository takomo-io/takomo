import { createUndeployStacksIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import {
  undeployStacksCommand,
  undeployStacksCommandIamPolicy,
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

const command = `undeploy [${COMMAND_PATH_OPT}]`
const describe = "Undeploy stacks within the given command path"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(undeployStacksCommandIamPolicy))
    .example(
      "$0 undeploy /networking",
      "Undeploy stacks within /networking path",
    )
    .example(
      "$0 undeploy /networking/vpc.yml",
      "Undeploy only the /networking/vpc.yml stack",
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
      describe: "Undeploy stacks within this path",
      type: "string",
      default: ROOT_STACK_GROUP_PATH,
    })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    configRepository: (ctx, logger) =>
      createFileSystemStacksConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    input: async (ctx, input) => ({
      ...input,
      ignoreDependencies: argv[IGNORE_DEPENDENCIES_OPT],
      commandPath: argv[COMMAND_PATH_OPT],
      interactive: argv.interactive,
    }),
    io: (ctx, logger) => createUndeployStacksIO({ logger }),
    executor: undeployStacksCommand,
  })

export const undeployStacksCmd: CommandModule<CommandArgs, CommandArgs> = {
  command,
  describe,
  builder,
  handler,
}
