import { RunProps } from "../common"
import { deployTargetsCmd } from "./deploy"
import { runTargetsCmd } from "./run"
import { showDeploymentTargetsConfigCmd } from "./show-config"
import { undeployTargetsCmd } from "./undeploy"
import { validateDeploymentTargetsCmd } from "./validate-config"

export const deploymentTargetsCmd = (props: RunProps) => ({
  command: "targets <command>",
  desc: "Deployment targets",
  builder: (yargs: any) =>
    yargs
      .command(deployTargetsCmd(props))
      .command(undeployTargetsCmd(props))
      .command(runTargetsCmd(props))
      .command(validateDeploymentTargetsCmd(props))
      .command(showDeploymentTargetsConfigCmd(props))
      .demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
})
