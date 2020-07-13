import { CliGetSecretIO } from "@takomo/cli-io"
import {
  getSecretCommand,
  getSecretCommandIamPolicy,
} from "@takomo/stacks-commands"
import { commonEpilog, handle } from "../../common"

export const getSecretCmd = {
  command: "get <stackPath> <secretName>",
  desc: "Get stack secret value by name",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(getSecretCommandIamPolicy))
      .positional("stackPath", {
        describe: "Stack path",
      })
      .positional("secretName", {
        describe: "Secret name",
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({
        ...ov,
        stackPath: argv.stackPath,
        secretName: argv.secretName,
      }),
      (input) => getSecretCommand(input, new CliGetSecretIO(input.options)),
    ),
}
