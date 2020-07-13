import { CliDeployOrganizationIO } from "@takomo/cli-io"
import {
  deployOrganizationCommand,
  deployOrganizationCommandIamPolicy,
} from "@takomo/organization-commands"
import { identity } from "@takomo/util"
import { commonEpilog, handle } from "../common"

export const deployOrganizationCmd = {
  command: "deploy",
  desc: "Deploy organization",
  builder: (yargs: any) =>
    yargs.epilog(commonEpilog(deployOrganizationCommandIamPolicy)),
  handler: (argv: any) =>
    handle(argv, identity, (input) =>
      deployOrganizationCommand(
        input,
        new CliDeployOrganizationIO(input.options),
      ),
    ),
}
