import { CliDescribeOrganizationIO } from "@takomo/cli-io"
import {
  describeOrganizationCommand,
  describeOrganizationCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../common"

export const describeOrganizationCmd = {
  command: "describe",
  desc: "Describe organization",
  builder: (yargs: any) =>
    yargs.epilog(commonEpilog(describeOrganizationCommandIamPolicy)),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ov,
      (input) =>
        describeOrganizationCommand(
          input,
          new CliDescribeOrganizationIO(input.options),
        ),
    ),
}
