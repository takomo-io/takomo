import yargs from "yargs"
import { RunProps } from "./common"
import { deploymentTargetsCmd } from "./deployment-targets"
import { iamCmd } from "./iam"
import { stacksCmd } from "./stacks"

export { initCommandContext } from "./common"

/**
 * @hidden
 */
export const run = (props: RunProps = { showHelpOnFail: true }): void => {
  yargs
    .command(stacksCmd(props))
    .command(deploymentTargetsCmd(props))
    .command(iamCmd(props))
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
      choices: ["trace", "debug", "info", "warn", "error", "none"],
      global: true,
    })
    .option("quiet", {
      alias: "q",
      description: "Suppress all console output expect the command result",
      boolean: true,
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
      description: "Print statistics after the command execution",
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
    .option("feature", {
      description: "Feature flag",
      string: true,
      global: true,
    })
    .option("show-generate-iam-policies", {
      description:
        "Show instructions how to generate IAM policies after the command execution",
      boolean: true,
      default: false,
      global: true,
    })
    .demandCommand(1, "Provide command")
    .recommendCommands()
    .strict(true)
    .showHelpOnFail(props?.showHelpOnFail === true)
    .help().argv
}
