import {
  CliDeployStacksIO,
  CliTearDownTargetsIO,
  CliUndeployStacksIO,
} from "@takomo/cli-io"
import { ConfigSetType } from "@takomo/config-sets"
import { DeploymentOperation, Options } from "@takomo/core"
import {
  deploymentTargetsOperationCommand,
  undeployTargetsOperationCommandIamPolicy,
} from "@takomo/deployment-targets"
import { commonEpilog, handle } from "../common"

const parseTargets = (value: any): string[] => {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export const tearDownTargetsCmd = {
  command: "tear-down [groups..]",
  desc: "Tear down deployment targets",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(undeployTargetsOperationCommandIamPolicy))
      .option("target", {
        description: "Targets to tear down",
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
        operation: DeploymentOperation.UNDEPLOY,
        configSetType: ConfigSetType.BOOTSTRAP,
      }),
      (input) =>
        deploymentTargetsOperationCommand(
          input,
          new CliTearDownTargetsIO(
            input.options,
            (options: Options, loggerName: string) =>
              new CliDeployStacksIO(options, loggerName),
            (options: Options, loggerName: string) =>
              new CliUndeployStacksIO(options, loggerName),
          ),
        ),
    ),
}
