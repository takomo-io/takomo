import { createBootstrapAccountsIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import { parseStringArray } from "@takomo/core"
import {
  accountsDeployOperationCommandIamPolicy,
  accountsOperationCommand,
} from "@takomo/organization-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../../common"
import { ACCOUNT_ID_ALIAS_OPT, ACCOUNT_ID_OPT } from "../../constants"

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
      .option(ACCOUNT_ID_OPT, {
        description: "Account id to bootstrap",
        alias: ACCOUNT_ID_ALIAS_OPT,
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
        accountIds: parseStringArray(argv[ACCOUNT_ID_OPT]),
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
