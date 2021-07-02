import { createTearDownAccountsIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import { parseStringArray } from "@takomo/core"
import {
  accountsOperationCommand,
  accountsUndeployOperationCommandIamPolicy,
} from "@takomo/organization-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../../common"

export const tearDownAccountsCmd = {
  command: "tear-down [organizationalUnits..]",
  desc: "Tear down accounts",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(accountsUndeployOperationCommandIamPolicy))
      .option("concurrent-accounts", {
        description: "Number of accounts to tear down concurrently",
        number: true,
        global: false,
        demandOption: false,
        default: 1,
      })
      .option("account-id", {
        description: "Account id to tear down",
        alias: "a",
        string: true,
        global: false,
        demandOption: false,
      }),
  handler: (argv: any) =>
    handle({
      argv,
      input: async (ctx, input) => ({
        ...input,
        organizationalUnits: argv.organizationalUnits || [],
        accountIds: parseStringArray(argv["account-id"]),
        concurrentAccounts: argv["concurrent-accounts"],
        operation: "undeploy" as DeploymentOperation,
        configSetType: "bootstrap" as ConfigSetType,
      }),
      configRepository: (ctx, logger) =>
        createFileSystemOrganizationConfigRepository({
          ctx,
          logger,
          ...ctx.filePaths,
        }),
      io: (ctx, logger) => createTearDownAccountsIO({ logger }),
      executor: accountsOperationCommand,
    }),
}
