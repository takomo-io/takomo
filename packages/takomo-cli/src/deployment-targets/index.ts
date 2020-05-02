import { deployTargetsCmd } from "./deploy"
import { undeployTargetsCmd } from "./undeploy"

export const deploymentTargetsCmd = {
  command: "targets <command>",
  desc: "Deployment targets",
  builder: (yargs: any) =>
    yargs.command(deployTargetsCmd).command(undeployTargetsCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
