import { CliDescribeOrganizationIO } from "@takomo/cli-io"
import { describeOrganizationCommand } from "@takomo/organization"
import { handle } from "../common"

export const describeOrganizationCmd = {
  command: "describe",
  desc: "Describe organization",
  builder: {},
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
