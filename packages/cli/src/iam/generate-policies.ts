import { Region } from "@takomo/aws-model"
import { createGenerateIamPoliciesIO } from "@takomo/cli-io"
import { generateIamPoliciesCommand } from "@takomo/iam-commands"
import { handle } from "../common"
import { parseStringArray } from "../parser"

export const generateIamPoliciesCmd = {
  command: "generate-policies",
  desc: "Generate IAM policies",
  builder: (yargs: any) =>
    yargs
      .option("identity", {
        description: "Include events by this identity",
        string: true,
        global: false,
        demandOption: true,
      })
      .option("start-time", {
        description: "Include events after this time",
        string: true,
        global: false,
        demandOption: true,
      })
      .option("end-time", {
        description: "Include events before this time",
        string: true,
        global: false,
        demandOption: true,
      })
      .option("region", {
        description: "Include events from this region",
        string: true,
        global: false,
        demandOption: true,
      })
      .coerce({
        "start-time": (s: string) => new Date(s),
        "end-time": (s: string) => new Date(s),
      }),
  handler: (argv: any) =>
    handle({
      argv,
      input: async (ctx, input) => ({
        ...input,
        ...ctx.filePaths,
        identities: parseStringArray(argv.identity),
        regions: parseStringArray(argv.region) as ReadonlyArray<Region>,
        startTime: argv["start-time"],
        endTime: argv["end-time"],
      }),
      io: (ctx, logger) => createGenerateIamPoliciesIO({ logger }),
      configRepository: async () => "",
      executor: generateIamPoliciesCommand,
    }),
}
