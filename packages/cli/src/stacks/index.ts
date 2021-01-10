import { deployStacksCmd } from "./deploy"
import { inspectCmd } from "./inspect"
import { listStacksCmd } from "./list"
import { undeployStacksCmd } from "./undeploy"

export const stacksCmd = {
  command: "stacks <command>",
  desc: "Manage stacks",
  builder: (yargs: any) =>
    yargs
      .command(listStacksCmd)
      .command(deployStacksCmd)
      .command(undeployStacksCmd)
      .command(inspectCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
