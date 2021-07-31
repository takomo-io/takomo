import { Argv } from "yargs"
import { RunProps } from "../common"
import { generateIamPoliciesCmd } from "./generate-policies"

export const iamCmd = (props: RunProps) => ({
  command: "iam <command>",
  desc: "IAM commands",
  builder: (yargs: Argv<any>) =>
    yargs
      .command(generateIamPoliciesCmd(props))
      .demandCommand(1, "Provide command"),
  // eslint-disable-next-line
  handler: (argv: any) => {},
})
