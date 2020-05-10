import { accountsCmd } from "./accounts"
import { createOrganizationCmd } from "./create"
import { describeOrganizationCmd } from "./describe"
import { deployOrganizationCmd } from "./deploy"

export const organizationCmd = {
  command: "org <command>",
  desc: "Manage organization",
  builder: (yargs: any) =>
    yargs
      .command(deployOrganizationCmd)
      .command(describeOrganizationCmd)
      .command(createOrganizationCmd)
      .command(accountsCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
