import { createDeployTargetsIO } from "@takomo/cli-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import { parseStringArray } from "@takomo/core"
import {
  deploymentTargetsOperationCommand,
  deployTargetsOperationCommandIamPolicy,
} from "@takomo/deployment-targets-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { CommandModule } from "yargs"
import { commonEpilog, handle } from "../common"
import {
  CONCURRENT_TARGETS_OPT,
  EXCLUDE_LABEL_OPT,
  EXCLUDE_TARGET_OPT,
  LABEL_OPT,
  TARGET_OPT,
} from "../constants"

const command = "deploy [groups..]"
const describe = "Deploy deployment targets"

const builder = (yargs: any) =>
  yargs
    .epilog(commonEpilog(deployTargetsOperationCommandIamPolicy))
    .option(CONCURRENT_TARGETS_OPT, {
      description: "Number of targets to deploy concurrently",
      number: true,
      global: false,
      demandOption: false,
      default: 1,
    })
    .option(TARGET_OPT, {
      description: "Targets to deploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option(EXCLUDE_TARGET_OPT, {
      description: "Targets exclude from deploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option(LABEL_OPT, {
      description: "Labels to deploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option(EXCLUDE_LABEL_OPT, {
      description: "Labels to exclude from deploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option("config-set", {
      description: "Config set to deploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option("command-path", {
      description: "Command path to deploy",
      string: true,
      global: false,
      demandOption: false,
    })
    .option("config-file", {
      description: "Deployment config file",
      string: true,
      global: false,
      demandOption: false,
    })

const handler = (argv: any) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      targets: parseStringArray(argv.target),
      excludeTargets: parseStringArray(argv[EXCLUDE_TARGET_OPT]),
      groups: argv.groups ?? [],
      configFile: argv["config-file"] ?? null,
      operation: "deploy" as DeploymentOperation,
      configSetType: "standard" as ConfigSetType,
      concurrentTargets: argv[CONCURRENT_TARGETS_OPT],
      labels: parseStringArray(argv.label),
      excludeLabels: parseStringArray(argv[EXCLUDE_LABEL_OPT]),
      commandPath: argv["command-path"],
      configSetName: argv["config-set"],
    }),
    io: (ctx, logger) => createDeployTargetsIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemDeploymentTargetsConfigRepository({
        ctx,
        logger,
        pathToDeploymentConfigFile: argv["config-file"],
        ...ctx.filePaths,
      }),
    executor: deploymentTargetsOperationCommand,
  })

export const deployTargetsCmd: CommandModule = {
  command,
  describe,
  builder,
  handler,
}
