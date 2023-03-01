import { Arguments, Argv, CommandModule } from "yargs"
import { createDeployStacksIO } from "../../cli-io/index.js"
import { CommandPath } from "../../command/command-model.js"
import { deployStacksCommand } from "../../command/stacks/deploy/command.js"
import { deployStacksCommandIamPolicy } from "../../command/stacks/deploy/iam-policy.js"
import { createFileSystemStacksConfigRepository } from "../../takomo-config-repository-fs/stacks/config-repository.js"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants.js"
import { commonEpilog, handle, RunProps } from "../common.js"
import {
  COMMAND_PATH_OPT,
  EXPECT_NO_CHANGES_OPT,
  IGNORE_DEPENDENCIES_OPT,
  INTERACTIVE_OPT,
} from "../constants.js"
import { stackDeployOperationOptions } from "./common.js"

type CommandArgs = {
  readonly [COMMAND_PATH_OPT]: CommandPath
  readonly [IGNORE_DEPENDENCIES_OPT]: boolean
  readonly [INTERACTIVE_OPT]: boolean
  readonly [EXPECT_NO_CHANGES_OPT]: boolean
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
    .options(stackDeployOperationOptions)
    .positional(COMMAND_PATH_OPT, {
      describe: "Deploy stacks within this path",
      string: true,
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
      expectNoChanges: argv[EXPECT_NO_CHANGES_OPT],
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

export const deployStacksCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
