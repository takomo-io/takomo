import { CliDeployOrganizationIO } from "@takomo/cli-io"
import { deployOrganizationCommand } from "@takomo/organization"
import { identity } from "@takomo/util"
import { handle } from "../common"

export const deployOrganizationCmd = {
  command: "deploy",
  desc: "Deploy organization",
  builder: {},
  handler: (argv: any) =>
    handle(argv, identity, (input) =>
      deployOrganizationCommand(
        input,
        new CliDeployOrganizationIO(input.options),
      ),
    ),
}
