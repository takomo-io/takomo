import { CliGetSecretIO } from "@takomo/cli-io"
import { getSecretCommand } from "@takomo/stacks-commands"
import { handle } from "../../common"

export const getSecretCmd = {
  command: "get <stackPath> <secretName>",
  desc: "Get stack secret value by name",
  builder: {},
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
