import { createUndeployTargetsIO } from "@takomo/cli-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import {
  deploymentTargetsOperationCommand,
  undeployTargetsOperationCommandIamPolicy,
} from "@takomo/deployment-targets-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../common"

const parseTargets = (value: any): string[] => {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export const undeployTargetsCmd = {
  command: "undeploy [groups..]",
  desc: "Undeploy deployment targets",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(undeployTargetsOperationCommandIamPolicy))
      .option("concurrent-targets", {
        description: "Number of targets to undeploy concurrently",
        number: true,
        global: false,
        demandOption: false,
        default: 1,
      })
      .option("target", {
        description: "Targets to undeploy",
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
        targets: parseTargets(argv.target),
        groups: argv.groups ?? [],
        configFile: argv["config-file"] ?? null,
        operation: "undeploy" as DeploymentOperation,
        configSetType: "standard" as ConfigSetType,
        concurrentTargets: argv["concurrent-targets"],
      }),
      io: (ctx, logger) => createUndeployTargetsIO({ logger }),
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
