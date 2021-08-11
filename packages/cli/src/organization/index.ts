import { RunProps } from "../common"
import { accountsCmd } from "./accounts"
import { createOrganizationCmd } from "./create"
import { deployOrganizationCmd } from "./deploy"
import { describeOrganizationCmd } from "./describe"

export const organizationCmd = (props: RunProps) => ({
  command: "org <command>",
  desc: "Manage organization",
  builder: (yargs: any) =>
    yargs
      .command(deployOrganizationCmd(props))
      .command(describeOrganizationCmd(props))
      .command(createOrganizationCmd(props))
      .command(accountsCmd(props))
      .demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
})
