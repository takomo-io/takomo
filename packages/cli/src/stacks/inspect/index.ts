import { configurationCmd } from "./configuration"
import { dependencyGraphCmd } from "./dependency-graph"

export const inspectCmd = {
  command: "inspect <command>",
  desc: "Inspect stacks",
  builder: (yargs: any) =>
    yargs.command(dependencyGraphCmd).command(configurationCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
