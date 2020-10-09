import {
  CliDeployStacksIO,
  CliUndeployAccountsIO,
  CliUndeployStacksIO,
} from "@takomo/cli-io"
import { ConfigSetType } from "@takomo/config-sets"
import { DeploymentOperation, Options } from "@takomo/core"
import {
  accountsOperationCommand,
  accountsUndeployOperationCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"
import { parseAccountIds } from "./fn"

export const undeployAccountsCmd = {
  command: "undeploy [organizationalUnits..]",
  desc: "Undeploy accounts",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(accountsUndeployOperationCommandIamPolicy))
      .option("account-id", {
        description: "Account id to undeploy",
        alias: "a",
        string: true,
        global: false,
        demandOption: false,
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({
        ...ov,
        organizationalUnits: argv.organizationalUnits || [],
        accountIds: parseAccountIds(argv["account-id"]),
        operation: DeploymentOperation.UNDEPLOY,
        configSetType: ConfigSetType.STANDARD,
      }),
      (input) =>
        accountsOperationCommand(
          input,
          new CliUndeployAccountsIO(
            input.options,
            (options: Options, accountId: string) =>
              new CliDeployStacksIO(options, console.log, accountId),
            (options: Options, accountId: string) =>
              new CliUndeployStacksIO(options, console.log, accountId),
          ),
        ),
    ),
}
