import { CommandInput, CommandOutput, IO } from "@takomo/core"

export type DescribeAccountInput = CommandInput

export type DescribeAccountOutput = CommandOutput

export interface DescribeAccountIO extends IO {
  printOutput(output: DescribeAccountOutput): DescribeAccountOutput
}
