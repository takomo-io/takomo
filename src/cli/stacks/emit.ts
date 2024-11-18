import { Arguments, Argv, CommandModule } from "yargs"
import { CommandPath } from "../../command/command-model.js"
import { deployStacksCommand } from "../../command/stacks/deploy/command.js"
import { emitStackTemplatesCommandIamPolicy } from "../../command/stacks/deploy/iam-policy.js"
import { createFileSystemStacksConfigRepository } from "../../takomo-config-repository-fs/stacks/config-repository.js"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants.js"
import { commonEpilog, handle, RunProps } from "../common.js"
import {
  COMMAND_PATH_OPT,
  IGNORE_DEPENDENCIES_OPT,
  INTERACTIVE_OPT,
  OUT_DIR_OPT,
  outputDirOptions,
  SKIP_HOOKS_OPT,
  SKIP_PARAMETERS_OPT,
  skipHooksOptions,
  skipParametersOptions,
} from "../constants.js"
import { stackDeployOperationOptions } from "./common.js"
import { createEmitStackTemplatesIO } from "../../cli-io/stacks/deploy-stacks/emit-stack-templates-io.js"

type CommandArgs = {
  readonly [COMMAND_PATH_OPT]: CommandPath
  readonly [IGNORE_DEPENDENCIES_OPT]: boolean
  readonly [INTERACTIVE_OPT]: boolean
  readonly [SKIP_HOOKS_OPT]: boolean
  readonly [SKIP_PARAMETERS_OPT]: boolean
  readonly [OUT_DIR_OPT]: string
}

const command = `emit [${COMMAND_PATH_OPT}]`
const describe = "Emit stack templates within the given command path"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(emitStackTemplatesCommandIamPolicy))
    .example(
      "$0 emit /networking",
      "Emit stack templates within /networking path to stdout",
    )
    .example(
      "$0 emit /networking/vpc.yml",
      "Emit only template of /networking/vpc.yml stack to stdout",
    )
    .example("$0 emit --out-dir /tmp", "Emit all stack templates to /tmp dir")
    .options({
      ...stackDeployOperationOptions,
      ...outputDirOptions,
      ...skipHooksOptions,
      ...skipParametersOptions,
    })
    .positional(COMMAND_PATH_OPT, {
      describe: "Emit stack templates within this path",
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
      emit: true,
      expectNoChanges: false,
      outDir: argv[OUT_DIR_OPT],
      skipHooks: argv[SKIP_HOOKS_OPT],
      skipParameters: argv[SKIP_PARAMETERS_OPT],
    }),
    io: (ctx, logger) => createEmitStackTemplatesIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemStacksConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: deployStacksCommand,
  })

export const emitStackTemplatesCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
