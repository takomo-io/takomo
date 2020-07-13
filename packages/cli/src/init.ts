import { CliInitProjectIO } from "@takomo/cli-io"
import { initProjectCommand } from "@takomo/init-command"
import { handle } from "./common"

export const initProjectCmd = {
  command: "init",
  desc: "Initialize a new Takomo project",
  builder: (yargs: any) =>
    yargs
      .option("project", {
        description: "Project name",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("regions", {
        description: "Project regions",
        array: true,
        global: false,
        demandOption: false,
      })
      .option("create-samples", {
        description: "Create sample stacks",
        boolean: true,
        global: false,
        demandOption: false,
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({
        ...ov,
        regions: argv.regions,
        project: argv.project,
        createSamples: argv["create-samples"],
      }),
      (input) => initProjectCommand(input, new CliInitProjectIO(input.options)),
    ),
}
