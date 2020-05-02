import { CliCreateOrganizationIO } from "@takomo/cli-io"
import { createOrganizationCommand } from "@takomo/organization"
import { handle } from "../common"

export const createOrganizationCmd = {
  command: "create",
  desc: "Create a new organization",
  builder: (yargs: any) =>
    yargs.option("feature-set", {
      description: "Feature set",
      string: true,
      global: false,
      default: "ALL",
      demandOption: false,
    }),
  handler: (argv: any) =>
    handle(
      argv,
      ov => ({
        ...ov,
        featureSet: argv["feature-set"],
      }),
      input =>
        createOrganizationCommand(
          input,
          new CliCreateOrganizationIO(input.options),
        ),
    ),
}
