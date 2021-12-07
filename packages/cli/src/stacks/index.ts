import { RunProps } from "../common"
import { deployStacksCmd } from "./deploy"
import { detectDriftCmd } from "./detect-drift"
import { inspectCmd } from "./inspect"
import { listStacksCmd } from "./list"
import { pruneStacksCmd } from "./prune"
import { undeployStacksCmd } from "./undeploy"

export const stacksCmd = (props: RunProps) => ({
  command: "stacks <command>",
  desc: "Manage stacks",
  builder: (yargs: any) =>
    yargs
      .command(listStacksCmd(props))
      .command(deployStacksCmd(props))
      .command(undeployStacksCmd(props))
      .command(pruneStacksCmd(props))
      .command(inspectCmd(props))
      .command(detectDriftCmd(props))
      .demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
})
