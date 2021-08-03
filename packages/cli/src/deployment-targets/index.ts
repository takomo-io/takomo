import { RunProps } from "../common"
import { bootstrapTargetsCmd } from "./bootstrap"
import { deployTargetsCmd } from "./deploy"
import { runTargetsCmd } from "./run"
import { tearDownTargetsCmd } from "./tear-down"
import { undeployTargetsCmd } from "./undeploy"

export const deploymentTargetsCmd = (props: RunProps) => ({
  command: "targets <command>",
  desc: "Deployment targets",
  builder: (yargs: any) =>
    yargs
      .command(deployTargetsCmd(props))
      .command(undeployTargetsCmd(props))
      .command(bootstrapTargetsCmd(props))
      .command(tearDownTargetsCmd(props))
      .command(runTargetsCmd)
      .demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
})
