import { createUndeployStacksIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import {
  undeployStacksCommand,
  undeployStacksCommandIamPolicy,
} from "@takomo/stacks-commands"
import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../common"
import {
  COMMAND_PATH_POSITIONAL,
  IGNORE_DEPENDENCIES_OPT,
  INTERACTIVE_ALIAS_OPT,
  INTERACTIVE_OPT,
} from "../constants"

export const undeployStacksCmd = {
  command: `undeploy [${COMMAND_PATH_POSITIONAL}]`,
  desc: "Undeploy stacks within the given command path",
  builder: (yargs: any) =>
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
        boolean: true,
        global: false,
        default: false,
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
      .positional(COMMAND_PATH_POSITIONAL, {
        describe: "Undeploy stacks within this path",
        default: ROOT_STACK_GROUP_PATH,
      }),
  handler: (argv: any) =>
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
        commandPath: argv.commandPath,
        interactive: argv.interactive,
      }),
      io: (ctx, logger) => createUndeployStacksIO({ logger }),
      executor: undeployStacksCommand,
    }),
}
