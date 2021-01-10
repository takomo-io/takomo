import { createInitProjectIO } from "@takomo/cli-io"
import { createFileSystemProjectConfigRepository } from "@takomo/config-repository-fs"
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
    handle({
      argv,
      input: (ctx, input) => ({
        ...input,
        ...ctx.filePaths,
        regions: argv.regions,
        project: argv.project,
        createSamples: argv["create-samples"],
      }),
      io: (ctx, logger) => createInitProjectIO(logger),
      configRepository: (ctx, logger) =>
        createFileSystemProjectConfigRepository({
          ctx,
          logger,
          ...ctx.filePaths,
        }),
      executor: initProjectCommand,
    }),
}
