import { createDeployStacksIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import {
  deployStacksCommand,
  deployStacksCommandIamPolicy,
} from "@takomo/stacks-commands"
import { commonEpilog, handle } from "../common"

export const deployStacksCmd = {
  command: "deploy [commandPath]",
  desc: "Deploy stacks within the given command path",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(deployStacksCommandIamPolicy))
      .example("$0 deploy /networking", "Deploy stacks within /networking path")
      .example(
        "$0 deploy /networking/vpc.yml",
        "Deploy only the /networking/vpc.yml stack",
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
        describe: "Deploy stacks within this path",
        default: "/",
      }),
  handler: (argv: any) =>
    handle({
      argv,
      input: (ctx, input) => ({
        ...input,
        ignoreDependencies: argv["ignore-dependencies"],
        commandPath: argv.commandPath,
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
    }),
}
