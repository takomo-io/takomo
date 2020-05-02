import { deployStacksCmd } from "./deploy"
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
      .command(secretsCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
