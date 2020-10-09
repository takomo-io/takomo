import {
  CliBootstrapAccountsIO,
  CliDeployStacksIO,
  CliUndeployStacksIO,
} from "@takomo/cli-io"
import { ConfigSetType } from "@takomo/config-sets"
import { DeploymentOperation, Options } from "@takomo/core"
import {
  accountsDeployOperationCommandIamPolicy,
  accountsOperationCommand,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"
import { parseAccountIds } from "./fn"

export const bootstrapAccountsCmd = {
  command: "bootstrap [organizationalUnits..]",
  desc: "Bootstrap accounts",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(accountsDeployOperationCommandIamPolicy))
      .option("account-id", {
        description: "Account id to bootstrap",
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
        operation: DeploymentOperation.DEPLOY,
        configSetType: ConfigSetType.BOOTSTRAP,
      }),
      (input) =>
        accountsOperationCommand(
          input,
          new CliBootstrapAccountsIO(
            input.options,
            (options: Options, accountId: string) =>
              new CliDeployStacksIO(options, console.log, accountId),
            (options: Options, accountId: string) =>
              new CliUndeployStacksIO(options, console.log, accountId),
          ),
        ),
    ),
}
