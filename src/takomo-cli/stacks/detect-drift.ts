import { Arguments, Argv, CommandModule } from "yargs"
import { CommandPath } from "../../command/command-model"
import { detectDriftCommand } from "../../command/stacks/drift/command"
import { detectDriftCommandIamPolicy } from "../../command/stacks/drift/iam-policy"
import { createDetectDriftIO } from "../../takomo-cli-io"
import { createFileSystemStacksConfigRepository } from "../../takomo-config-repository-fs/stacks/config-repository"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants"
import { commonEpilog, handle, RunProps } from "../common"
import { COMMAND_PATH_OPT } from "../constants"

type CommandArgs = {
  readonly [COMMAND_PATH_OPT]: CommandPath
}

const command = `detect-drift [${COMMAND_PATH_OPT}]`
const describe = "Detect drift within the given command path"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(detectDriftCommandIamPolicy))
    .positional(COMMAND_PATH_OPT, {
      describe: "Detect drift from stacks within this path",
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
    io: (ctx, logger) => createDetectDriftIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemStacksConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: detectDriftCommand,
  })

export const detectDriftCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
