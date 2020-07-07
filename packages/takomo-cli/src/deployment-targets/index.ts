import { bootstrapTargetsCmd } from "./bootstrap"
import { deployTargetsCmd } from "./deploy"
import { tearDownTargetsCmd } from "./tear-down"
import { undeployTargetsCmd } from "./undeploy"

export const deploymentTargetsCmd = {
  command: "targets <command>",
  desc: "Deployment targets",
  builder: (yargs: any) =>
    yargs
      .command(deployTargetsCmd)
      .command(undeployTargetsCmd)
      .command(bootstrapTargetsCmd)
      .command(tearDownTargetsCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
