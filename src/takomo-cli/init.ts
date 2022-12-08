import { Arguments, Argv, CommandModule } from "yargs"
import { Region } from "../aws/common/model"
import { initProjectCommand } from "../command/init/command"
import { createInitProjectIO } from "../takomo-cli-io"
import { createFileSystemProjectConfigRepository } from "../takomo-config-repository-fs"
import { Project } from "../takomo-core/command"
import { handle } from "./common"

const CREATE_SAMPLES_OPT = "create-samples"
const PROJECT_OPT = "project"
const REGIONS_OPT = "regions"

type CommandArgs = {
  readonly [PROJECT_OPT]?: Project
  readonly [REGIONS_OPT]?: ReadonlyArray<Region>
  readonly [CREATE_SAMPLES_OPT]?: boolean
}

const command = "init"
const describe = "Initialize a new Takomo project"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.options({
    [PROJECT_OPT]: {
      description: "Project name",
      string: true,
      global: false,
      demandOption: false,
    },
    [REGIONS_OPT]: {
      description: "Project regions",
      array: true,
      string: true,
      global: false,
      demandOption: false,
    },
    [CREATE_SAMPLES_OPT]: {
      description: "Create sample stacks",
      boolean: true,
      global: false,
      demandOption: false,
    },
  })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      regions: argv.regions,
      project: argv.project,
      createSamples: argv[CREATE_SAMPLES_OPT],
    }),
    io: (ctx, logger) => createInitProjectIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemProjectConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: initProjectCommand,
  })

export const initProjectCmd: CommandModule<CommandArgs, CommandArgs> = {
  command,
  describe,
  builder,
  handler,
}
