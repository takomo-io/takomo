import {
  CliDeployStacksIO,
  CliDeployTargetsIO,
  CliUndeployStacksIO,
} from "@takomo/cli-io"
import { ConfigSetType } from "@takomo/config-sets"
import { DeploymentOperation, Options } from "@takomo/core"
import {
  deploymentTargetsOperationCommand,
  deployTargetsOperationCommandIamPolicy,
} from "@takomo/deployment-targets"
import { commonEpilog, handle } from "../common"

const parseTargets = (value: any): string[] => {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export const deployTargetsCmd = {
  command: "deploy [groups..]",
  desc: "Deploy deployment targets",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(deployTargetsOperationCommandIamPolicy))
      .option("target", {
        description: "Targets to deploy",
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
    handle(
      argv,
      (ov) => ({
        ...ov,
        targets: parseTargets(argv.target),
        groups: argv.groups || [],
        configFile: argv["config-file"] || null,
        operation: DeploymentOperation.DEPLOY,
        configSetType: ConfigSetType.STANDARD,
      }),
      (input) =>
        deploymentTargetsOperationCommand(
          input,
          new CliDeployTargetsIO(
            input.options,
            (options: Options, loggerName: string) =>
              new CliDeployStacksIO(options, console.log, loggerName),
            (options: Options, loggerName: string) =>
              new CliUndeployStacksIO(options, console.log, loggerName),
          ),
        ),
    ),
}
