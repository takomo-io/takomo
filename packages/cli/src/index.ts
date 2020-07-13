import yargs from "yargs"
import { deploymentTargetsCmd } from "./deployment-targets/index.js"
import { initProjectCmd } from "./init.js"
import { organizationCmd } from "./organization/index.js"
import { stacksCmd } from "./stacks/index.js"

export { initOptionsAndVariables } from "./common.js"

export const run = (): void => {
  yargs
    .command(stacksCmd)
    .command(organizationCmd)
    .command(deploymentTargetsCmd)
    .command(initProjectCmd)
    .option("profile", {
      alias: "p",
      description: "AWS profile",
      string: true,
      global: true,
    })
    .option("log", {
      description: "Set logging level",
      string: true,
      default: "info",
      choices: ["trace", "debug", "info", "warn", "error"],
      global: true,
    })
    .option("log-confidential-info", {
      description: "Log confidential information",
      boolean: true,
      default: false,
      global: true,
    })
    .option("yes", {
      alias: "y",
      description: "Assume yes to all questions",
      boolean: true,
      default: false,
      global: true,
    })
    .option("stats", {
      description: "Print statistics after command execution",
      boolean: true,
      default: false,
      global: true,
    })
    .option("load-aws-sdk-config", {
      description:
        "Prefer loading credentials from configuration file over the credentials file",
      boolean: true,
      default: false,
      global: true,
    })
    .option("dir", {
      alias: "d",
      description: "Path to project dir",
      string: true,
      global: true,
    })
    .option("var", {
      description: "Variable",
      string: true,
      global: true,
    })
    .option("var-file", {
      description: "Variable file",
      string: true,
      global: true,
    })
    .option("env-file", {
      description: "Environment variables file",
      string: true,
      global: true,
    })
    .demandCommand(1, "Provide command")
    .strict(true)
    .help().argv
}
