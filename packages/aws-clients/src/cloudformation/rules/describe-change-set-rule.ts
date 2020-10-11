import { evaluateRules, Rule } from "@takomo/util"
import { DescribeChangeSetOutput } from "aws-sdk/clients/cloudformation"

export type DescribeChangeSetResult =
  | "PENDING"
  | "READY"
  | "NO_CHANGES"
  | "FAILED"
  | "ERROR"

type DescribeChangeSetRuleRule = Rule<
  DescribeChangeSetOutput,
  DescribeChangeSetResult
>

export const changeSetReadyRule: DescribeChangeSetRuleRule = ({
  Status,
}: DescribeChangeSetOutput) =>
  Status === "CREATE_COMPLETE" ? "READY" : undefined

export const changeSetPendingRule: DescribeChangeSetRuleRule = ({
  Status,
}: DescribeChangeSetOutput) =>
  Status === "CREATE_IN_PROGRESS" || Status === "CREATE_PENDING"
    ? "PENDING"
    : undefined

export const changeSetFailedRule: DescribeChangeSetRuleRule = ({
  Status,
}: DescribeChangeSetOutput) => (Status === "FAILED" ? "FAILED" : undefined)

export const changeSetNoChangesRule: DescribeChangeSetRuleRule = ({
  Status,
  StatusReason,
}: DescribeChangeSetOutput) => {
  if (Status !== "FAILED") {
    return undefined
  }

  const text1 = "The submitted information didn't contain changes"
  const text2 = "No updates are to be performed"
  return StatusReason?.startsWith(text1) || StatusReason?.startsWith(text2)
    ? "NO_CHANGES"
    : undefined
}

const rules = [
  changeSetReadyRule,
  changeSetPendingRule,
  changeSetNoChangesRule,
  changeSetFailedRule,
]

export const evaluateDescribeChangeSet = (
  output: DescribeChangeSetOutput,
): DescribeChangeSetResult => evaluateRules(rules, output, () => "ERROR")
