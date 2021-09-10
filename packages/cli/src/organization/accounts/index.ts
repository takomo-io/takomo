import { RunProps } from "../../common"
import { bootstrapAccountsCmd } from "./bootstrap"
import { createAccountCmd } from "./create"
import { createAccountAliasCmd } from "./create-account-alias"
import { deleteAccountAliasCmd } from "./delete-account-alias"
import { deployAccountsCmd } from "./deploy"
import { listAccountsCmd } from "./list"
import { listAccountsStacksCmd } from "./list-stacks"
import { tearDownAccountsCmd } from "./tear-down"
import { undeployAccountsCmd } from "./undeploy"

export const accountsCmd = (props: RunProps) => ({
  command: "accounts <command>",
  desc: "Manage organization accounts",
  builder: (yargs: any) =>
    yargs
      .command(listAccountsCmd(props))
      .command(listAccountsStacksCmd(props))
      .command(createAccountCmd(props))
      .command(deployAccountsCmd(props))
      .command(undeployAccountsCmd(props))
      .command(bootstrapAccountsCmd(props))
      .command(tearDownAccountsCmd(props))
      .command(createAccountAliasCmd(props))
      .command(deleteAccountAliasCmd(props))
      .demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
})
