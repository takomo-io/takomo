import { CliSetSecretIO } from "@takomo/cli-io"
import {
  setSecretCommand,
  setSecretCommandIamPolicy,
} from "@takomo/stacks-commands"
import { commonEpilog, handle } from "../../common"

export const setSecretCmd = {
  command: "set <stackPath> <secretName>",
  desc: "Set stack secret value by name",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(setSecretCommandIamPolicy))
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
      (input) => setSecretCommand(input, new CliSetSecretIO(input.options)),
    ),
}
