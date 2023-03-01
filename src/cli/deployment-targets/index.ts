import { RunProps } from "../common.js"
import { deployTargetsCmd } from "./deploy.js"
import { runTargetsCmd } from "./run.js"
import { showDeploymentTargetsConfigCmd } from "./show-config.js"
import { undeployTargetsCmd } from "./undeploy.js"
import { validateDeploymentTargetsCmd } from "./validate-config.js"

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
