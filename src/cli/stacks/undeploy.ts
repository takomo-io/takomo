import { Arguments, Argv, CommandModule } from "yargs"
import { createUndeployStacksIO } from "../../cli-io/index.js"
import { CommandPath } from "../../command/command-model.js"
import { undeployStacksCommand } from "../../command/stacks/undeploy/command.js"
import { undeployStacksCommandIamPolicy } from "../../command/stacks/undeploy/iam-policy.js"
import { createFileSystemStacksConfigRepository } from "../../takomo-config-repository-fs/stacks/config-repository.js"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants.js"
import { commonEpilog, handle, RunProps } from "../common.js"
import {
  COMMAND_PATH_OPT,
  IGNORE_DEPENDENCIES_OPT,
  INTERACTIVE_OPT,
} from "../constants.js"
import { stackOperationOptions } from "./common.js"

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
    .options(stackOperationOptions)
    .positional(COMMAND_PATH_OPT, {
      describe: "Undeploy stacks within this path",
      string: true,
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
      prune: false,
    }),
    io: (ctx, logger) => createUndeployStacksIO({ logger }),
    executor: undeployStacksCommand,
  })

export const undeployStacksCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
