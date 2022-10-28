import { RunProps } from "../common"
import { bootstrapTargetsCmd } from "./bootstrap"
import { deployTargetsCmd } from "./deploy"
import { runTargetsCmd } from "./run"
import { showDeploymentTargetsConfigCmd } from "./show-config"
import { tearDownTargetsCmd } from "./tear-down"
import { undeployTargetsCmd } from "./undeploy"
import { validateDeploymentTargetsCmd } from "./validate-config"

export const deploymentTargetsCmd = (props: RunProps) => ({
  command: "targets <command>",
  desc: "Deployment targets",
  builder: (yargs: any) =>
    yargs
      .command(deployTargetsCmd(props))
      .command(undeployTargetsCmd(props))
      .command(bootstrapTargetsCmd(props))
      .command(tearDownTargetsCmd(props))
      .command(runTargetsCmd(props))
      .command(validateDeploymentTargetsCmd(props))
      .command(showDeploymentTargetsConfigCmd(props))
      .demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
})
