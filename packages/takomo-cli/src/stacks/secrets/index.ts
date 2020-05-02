import { diffSecretsCmd } from "./diff"
import { getSecretCmd } from "./get"
import { listSecretsCmd } from "./list"
import { setSecretCmd } from "./set"
import { syncSecretsCmd } from "./sync"

export const secretsCmd = {
  command: "secrets <command>",
  desc: "Manage secrets",
  builder: (yargs: any) =>
    yargs
      .command(getSecretCmd)
      .command(setSecretCmd)
      .command(listSecretsCmd)
      .command(diffSecretsCmd)
      .command(syncSecretsCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
