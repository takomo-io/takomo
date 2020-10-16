import { bootstrapAccountsCmd } from "./bootstrap"
import { createAccountCmd } from "./create"
import { createAliasCmd } from "./create-alias"
import { deleteAliasCmd } from "./delete-alias"
import { deployAccountsCmd } from "./deploy"
import { listAccountsCmd } from "./list"
import { tearDownAccountsCmd } from "./tear-down"
import { undeployAccountsCmd } from "./undeploy"

export const accountsCmd = {
  command: "accounts <command>",
  desc: "Manage organization accounts",
  builder: (yargs: any) =>
    yargs
      .command(listAccountsCmd)
      .command(createAccountCmd)
      .command(deployAccountsCmd)
      .command(undeployAccountsCmd)
      .command(bootstrapAccountsCmd)
      .command(tearDownAccountsCmd)
      .command(createAliasCmd)
      .command(deleteAliasCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
