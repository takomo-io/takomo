import { CliLaunchOrganizationIO } from "@takomo/cli-io"
import { launchOrganizationCommand } from "@takomo/organization"
import { identity } from "@takomo/util"
import { handle } from "../common"

export const launchOrganizationCmd = {
  command: "launch",
  desc: "Launch organization",
  builder: {},
  handler: (argv: any) =>
    handle(argv, identity, (input) =>
      launchOrganizationCommand(
        input,
        new CliLaunchOrganizationIO(input.options),
      ),
    ),
}
