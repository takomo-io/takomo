import { bootstrapTargetsCmd } from "./bootstrap"
import { deployTargetsCmd } from "./deploy"
import { runTargetsCmd } from "./run"
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
      .command(tearDownTargetsCmd)
      .command(runTargetsCmd)
      .demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
