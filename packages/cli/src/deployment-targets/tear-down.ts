import { createTearDownTargetsIO } from "@takomo/cli-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import { parseStringArray } from "@takomo/core"
import {
  deploymentTargetsOperationCommand,
  undeployTargetsOperationCommandIamPolicy,
} from "@takomo/deployment-targets-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../common"

export const tearDownTargetsCmd = {
  command: "tear-down [groups..]",
  desc: "Tear down deployment targets",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(undeployTargetsOperationCommandIamPolicy))
      .option("concurrent-targets", {
        description: "Number of targets to tear down concurrently",
        number: true,
        global: false,
        demandOption: false,
        default: 1,
      })
      .option("target", {
        description: "Targets to tear down",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("exclude-target", {
        description: "Targets exclude from tear down",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("label", {
        description: "Labels to tear down",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("exclude-label", {
        description: "Labels to exclude from deploy",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("config-set", {
        description: "Config set to tear down",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("command-path", {
        description: "Command path to tear down",
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
        operation: "undeploy" as DeploymentOperation,
        configSetType: "bootstrap" as ConfigSetType,
        concurrentTargets: argv["concurrent-targets"],
        labels: parseStringArray(argv.label),
        excludeLabels: parseStringArray(argv["exclude-label"]),
        commandPath: argv["command-path"],
        configSetName: argv["config-set"],
      }),
      io: (ctx, logger) => createTearDownTargetsIO({ logger }),
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
