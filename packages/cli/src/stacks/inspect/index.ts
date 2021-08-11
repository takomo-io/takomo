import { RunProps } from "../../common"
import { configurationCmd } from "./configuration"
import { dependencyGraphCmd } from "./dependency-graph"

export const inspectCmd = (props: RunProps) => ({
  command: "inspect <command>",
  desc: "Inspect stacks",
  builder: (yargs: any) =>
    yargs
      .command(dependencyGraphCmd(props))
      .command(configurationCmd(props))
      .demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
})
