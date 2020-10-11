import { dependencyGraphCmd } from "./dependency-graph"

export const inspectCmd = {
  command: "inspect <command>",
  desc: "Inspect stacks",
  builder: (yargs: any) => yargs.command(dependencyGraphCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
