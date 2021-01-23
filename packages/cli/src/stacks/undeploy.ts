import { createUndeployStacksIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import {
  undeployStacksCommand,
  undeployStacksCommandIamPolicy,
} from "@takomo/stacks-commands"
import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../common"

export const undeployStacksCmd = {
  command: "undeploy [commandPath]",
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
      .option("ignore-dependencies", {
        description: "Ignore stack dependencies",
        boolean: true,
        global: false,
        default: false,
        demandOption: false,
      })
      .option("interactive", {
        alias: "i",
        description: "Interactive selecting of command path",
        boolean: true,
        global: false,
        default: false,
        demandOption: false,
      })
      .positional("commandPath", {
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
      input: (ctx, input) => ({
        ...input,
        ignoreDependencies: argv["ignore-dependencies"],
        commandPath: argv.commandPath,
        interactive: argv.interactive,
      }),
      io: (ctx, logger) => createUndeployStacksIO({ logger }),
      executor: undeployStacksCommand,
    }),
}
