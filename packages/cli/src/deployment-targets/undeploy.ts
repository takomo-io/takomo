import { createUndeployTargetsIO } from "@takomo/cli-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import { parseStringArray } from "@takomo/core"
import {
  deploymentTargetsOperationCommand,
  undeployTargetsOperationCommandIamPolicy,
} from "@takomo/deployment-targets-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle } from "../common"
import {
  COMMAND_PATH_OPT,
  CONCURRENT_TARGETS_OPT,
  CONFIG_FILE_OPT,
  EXCLUDE_LABEL_OPT,
  EXCLUDE_TARGET_OPT,
  LABEL_OPT,
  TARGET_OPT,
} from "../constants"

type CommandArgs = any

const command = "undeploy [groups..]"
const describe = "Undeploy deployment targets"
const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(undeployTargetsOperationCommandIamPolicy))
    .option(CONCURRENT_TARGETS_OPT, {
      description: "Number of targets to undeploy concurrently",
      number: true,
      global: false,
      demandOption: false,
      default: 1,
    })
    .option(TARGET_OPT, {
      description: "Targets to undeploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option(EXCLUDE_TARGET_OPT, {
      description: "Targets exclude from undeploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option(LABEL_OPT, {
      description: "Labels to undeploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option(EXCLUDE_LABEL_OPT, {
      description: "Labels to exclude from undeploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option("config-set", {
      description: "Config set to undeploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option(COMMAND_PATH_OPT, {
      description: "Command path to undeploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option(CONFIG_FILE_OPT, {
      description: "Deployment config file",
      string: true,
      global: false,
      demandOption: false,
    })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      targets: parseStringArray(argv.target),
      excludeTargets: parseStringArray(argv[EXCLUDE_TARGET_OPT]),
      groups: argv.groups ?? [],
      configFile: argv[CONFIG_FILE_OPT] ?? null,
      operation: "undeploy" as DeploymentOperation,
      configSetType: "standard" as ConfigSetType,
      concurrentTargets: argv[CONCURRENT_TARGETS_OPT],
      labels: parseStringArray(argv.label),
      excludeLabels: parseStringArray(argv[EXCLUDE_LABEL_OPT]),
      commandPath: argv[COMMAND_PATH_OPT],
      configSetName: argv["config-set"],
    }),
    io: (ctx, logger) => createUndeployTargetsIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemDeploymentTargetsConfigRepository({
        ctx,
        logger,
        pathToDeploymentConfigFile: argv[CONFIG_FILE_OPT],
        ...ctx.filePaths,
      }),
    executor: deploymentTargetsOperationCommand,
  })

export const undeployTargetsCmd: CommandModule<CommandArgs, CommandArgs> = {
  command,
  describe,
  builder,
  handler,
}
