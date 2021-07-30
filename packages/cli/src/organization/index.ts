import { accountsCmd } from "./accounts"
import { createOrganizationCmd } from "./create"
import { deployOrganizationCmd } from "./deploy"
import { describeOrganizationCmd } from "./describe"

export const organizationCmd = {
  command: "org <command>",
  desc: "Manage organization",
  builder: (yargs: any) =>
    yargs
      .command(deployOrganizationCmd)
      .command(describeOrganizationCmd)
      .command(createOrganizationCmd)
      .command(accountsCmd)
      .demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
