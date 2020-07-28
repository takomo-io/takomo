import { CliDeployStacksIO } from "@takomo/cli-io"
import { Constants } from "@takomo/core"
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
        default: Constants.ROOT_STACK_GROUP_PATH,
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({
        ...ov,
        ignoreDependencies: argv["ignore-dependencies"],
        commandPath: argv.commandPath,
        interactive: argv.interactive,
      }),
      (input) =>
        deployStacksCommand(input, new CliDeployStacksIO(input.options)),
    ),
}
