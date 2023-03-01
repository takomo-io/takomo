import { RunProps } from "../common.js"
import { deployStacksCmd } from "./deploy.js"
import { detectDriftCmd } from "./detect-drift.js"
import { inspectCmd } from "./inspect/index.js"
import { listStacksCmd } from "./list.js"
import { pruneStacksCmd } from "./prune.js"
import { undeployStacksCmd } from "./undeploy.js"

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
