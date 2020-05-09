import { CliUndeployStacksIO } from "@takomo/cli-io"
import { Constants } from "@takomo/core"
import { undeployStacksCommand } from "@takomo/stacks-commands"
import { handle } from "../common"

export const undeployStacksCmd = {
  command: "undeploy [commandPath]",
  desc: "Undeploy stacks within the given command path",
  builder: (yargs: any) =>
    yargs
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
        undeployStacksCommand(input, new CliUndeployStacksIO(input.options)),
    ),
}
