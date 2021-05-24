import { createBootstrapTargetsIO } from "@takomo/cli-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import {
  deploymentTargetsOperationCommand,
  deployTargetsOperationCommandIamPolicy,
} from "@takomo/deployment-targets-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../common"
import { parseStringArray } from "../parser"

export const bootstrapTargetsCmd = {
  command: "bootstrap [groups..]",
  desc: "Bootstrap deployment targets",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(deployTargetsOperationCommandIamPolicy))
      .option("concurrent-targets", {
        description: "Number of targets to bootstrap concurrently",
        number: true,
        global: false,
        demandOption: false,
        default: 1,
      })
      .option("target", {
        description: "Targets to bootstrap",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("exclude-target", {
        description: "Targets exclude from bootstrap",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("label", {
        description: "Labels to bootstrap",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("exclude-label", {
        description: "Labels to exclude from tear down",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("config-set", {
        description: "Config set to bootstrap",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("command-path", {
        description: "Command path to bootstrap",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("config-file", {
        description: "Deployment config file",
        string: true,
        global: false,
        demandOption: false,
      }),
  handler: (argv: any) =>
    handle({
      argv,
      input: async (ctx, input) => ({
        ...input,
        targets: parseStringArray(argv.target),
        excludeTargets: parseStringArray(argv["exclude-target"]),
        groups: argv.groups ?? [],
        configFile: argv["config-file"] ?? null,
        operation: "deploy" as DeploymentOperation,
        configSetType: "bootstrap" as ConfigSetType,
        concurrentTargets: argv["concurrent-targets"],
        labels: parseStringArray(argv.label),
        excludeLabels: parseStringArray(argv["exclude-label"]),
        commandPath: argv["command-path"],
        configSetName: argv["config-set"],
      }),
      io: (ctx, logger) => createBootstrapTargetsIO({ logger }),
      configRepository: (ctx, logger) =>
        createFileSystemDeploymentTargetsConfigRepository({
          ctx,
          logger,
          pathToDeploymentConfigFile: argv["config-file"],
          ...ctx.filePaths,
        }),
      executor: deploymentTargetsOperationCommand,
    }),
}
