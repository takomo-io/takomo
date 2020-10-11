import { deployStacksCmd } from "./deploy"
import { inspectCmd } from "./inspect"
import { listStacksCmd } from "./list"
import { secretsCmd } from "./secrets"
import { undeployStacksCmd } from "./undeploy"

export const stacksCmd = {
  command: "stacks <command>",
  desc: "Manage stacks",
  builder: (yargs: any) =>
    yargs
      .command(listStacksCmd)
      .command(deployStacksCmd)
      .command(undeployStacksCmd)
      .command(inspectCmd)
      .command(secretsCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
