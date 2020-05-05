import {
  CliDeployStacksIO,
  CliTearDownAccountsIO,
  CliUndeployStacksIO,
} from "@takomo/cli-io"
import { ConfigSetType } from "@takomo/config-sets"
import { DeploymentOperation, Options } from "@takomo/core"
import { accountsOperationCommand } from "@takomo/organization"
import { handle } from "../../common"
import { parseAccountIds } from "./fn"

export const tearDownAccountsCmd = {
  command: "tear-down [organizationalUnits..]",
  desc: "Tear down accounts",
  builder: (yargs: any) =>
    yargs.option("account-id", {
      description: "Account id to tear down",
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
        configSetType: ConfigSetType.BOOTSTRAP,
      }),
      (input) =>
        accountsOperationCommand(
          input,
          new CliTearDownAccountsIO(
            input.options,
            (options: Options, accountId: string) =>
              new CliDeployStacksIO(options, accountId),
            (options: Options, accountId: string) =>
              new CliUndeployStacksIO(options, accountId),
          ),
        ),
    ),
}
