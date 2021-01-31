import { createBootstrapTargetsIO } from "@takomo/cli-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import {
  deploymentTargetsOperationCommand,
  deployTargetsOperationCommandIamPolicy,
} from "@takomo/deployment-targets-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../common"

const parseTargets = (value: any): string[] => {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export const bootstrapTargetsCmd = {
  command: "bootstrap [groups..]",
  desc: "Bootstrap deployment targets",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(deployTargetsOperationCommandIamPolicy))
      .option("target", {
        description: "Targets to bootstrap",
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
      input: (ctx, input) => ({
        ...input,
        targets: parseTargets(argv.target),
        groups: argv.groups || [],
        configFile: argv["config-file"] || null,
        operation: "deploy" as DeploymentOperation,
        configSetType: "bootstrap" as ConfigSetType,
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
