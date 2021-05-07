import { createUndeployAccountsIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import {
  accountsOperationCommand,
  accountsUndeployOperationCommandIamPolicy,
} from "@takomo/organization-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../../common"
import { parseAccountIds } from "./fn"

export const undeployAccountsCmd = {
  command: "undeploy [organizationalUnits..]",
  desc: "Undeploy accounts",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(accountsUndeployOperationCommandIamPolicy))
      .option("concurrent-accounts", {
        description: "Number of accounts to undeploy concurrently",
        number: true,
        global: false,
        demandOption: false,
        default: 1,
      })
      .option("account-id", {
        description: "Account id to undeploy",
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
        accountIds: parseAccountIds(argv["account-id"]),
        concurrentAccounts: argv["concurrent-accounts"],
        operation: "undeploy" as DeploymentOperation,
        configSetType: "standard" as ConfigSetType,
      }),
      configRepository: (ctx, logger) =>
        createFileSystemOrganizationConfigRepository({
          ctx,
          logger,
          ...ctx.filePaths,
        }),
      io: (ctx, logger) => createUndeployAccountsIO({ logger }),
      executor: accountsOperationCommand,
    }),
}
