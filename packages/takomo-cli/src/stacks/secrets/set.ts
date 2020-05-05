import { CliSetSecretIO } from "@takomo/cli-io"
import { setSecretCommand } from "@takomo/stacks"
import { handle } from "../../common"

export const setSecretCmd = {
  command: "set <stackPath> <secretName>",
  desc: "Set stack secret value by name",
  builder: {},
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
