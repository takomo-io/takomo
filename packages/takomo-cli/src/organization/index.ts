import { accountsCmd } from "./accounts"
import { createOrganizationCmd } from "./create"
import { describeOrganizationCmd } from "./describe"
import { launchOrganizationCmd } from "./launch"

export const organizationCmd = {
  command: "org <command>",
  desc: "Manage organization",
  builder: (yargs: any) =>
    yargs
      .command(launchOrganizationCmd)
      .command(describeOrganizationCmd)
      .command(createOrganizationCmd)
      .command(accountsCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
