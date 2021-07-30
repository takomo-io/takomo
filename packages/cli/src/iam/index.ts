import { generateIamPoliciesCmd } from "./generate-policies"

export const iamCmd = {
  command: "iam <command>",
  desc: "IAM commands",
  builder: (yargs: any) =>
    yargs.command(generateIamPoliciesCmd).demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
