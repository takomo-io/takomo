import { bootstrapAccountsCmd } from "./bootstrap"
import { createAccountCmd } from "./create"
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
      .command(tearDownAccountsCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
