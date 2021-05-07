import { createBootstrapAccountsIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import {
  accountsDeployOperationCommandIamPolicy,
  accountsOperationCommand,
} from "@takomo/organization-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../../common"
import { parseAccountIds } from "./fn"

export const bootstrapAccountsCmd = {
  command: "bootstrap [organizationalUnits..]",
  desc: "Bootstrap accounts",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(accountsDeployOperationCommandIamPolicy))
      .option("concurrent-accounts", {
        description: "Number of accounts to bootstrap concurrently",
        number: true,
        global: false,
        demandOption: false,
        default: 1,
      })
      .option("account-id", {
        description: "Account id to bootstrap",
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
        operation: "deploy" as DeploymentOperation,
        configSetType: "bootstrap" as ConfigSetType,
      }),
      configRepository: (ctx, logger) =>
        createFileSystemOrganizationConfigRepository({
          ctx,
          logger,
          ...ctx.filePaths,
        }),
      io: (ctx, logger) => createBootstrapAccountsIO({ logger }),
      executor: accountsOperationCommand,
    }),
}
