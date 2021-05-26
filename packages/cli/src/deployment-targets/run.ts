import { createRunTargetsIO } from "@takomo/cli-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import { deploymentTargetsRunCommand } from "@takomo/deployment-targets-commands"
import { commonEpilog, handle } from "../common"
import { parseStringArray } from "../parser"

export const runTargetsCmd = {
  command: "run [groups..]",
  desc: "Run script against deployment targets",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(() => ""))
      .option("concurrent-targets", {
        description: "Number of targets to process concurrently",
        number: true,
        global: false,
        demandOption: false,
        default: 1,
      })
      .option("target", {
        description: "Targets to include in run",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("exclude-target", {
        description: "Targets to exclude from run",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("label", {
        description: "Labels to include in run",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("exclude-label", {
        description: "Labels to exclude from run",
        string: true,
        global: false,
        demandOption: false,
      })
      .option("command", {
        description: "Command to run",
        string: true,
        global: false,
        demandOption: true,
      })
      .option("role-name", {
        description: "Name of role to assume from each target",
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
        configSetType: "standard" as ConfigSetType,
        concurrentTargets: argv["concurrent-targets"],
        labels: parseStringArray(argv.label),
        excludeLabels: parseStringArray(argv["exclude-label"]),
        command: argv.command,
        roleName: argv["role-name"],
      }),
      io: (ctx, logger) => createRunTargetsIO({ logger }),
      configRepository: (ctx, logger) =>
        createFileSystemDeploymentTargetsConfigRepository({
          ctx,
          logger,
          pathToDeploymentConfigFile: argv["config-file"],
          ...ctx.filePaths,
        }),
      executor: deploymentTargetsRunCommand,
    }),
}
