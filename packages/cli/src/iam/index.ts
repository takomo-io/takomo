import { generateIamPoliciesCmd } from "./generate-policies"

export const iamCmd = {
  command: "iam <command>",
  desc: "IAM commands",
  builder: (yargs: any) => yargs.command(generateIamPoliciesCmd),
  // eslint-disable-next-line
  handler: (argv: any) => {},
}
