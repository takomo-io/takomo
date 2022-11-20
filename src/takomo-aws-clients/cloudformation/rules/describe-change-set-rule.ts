import { ChangeSet } from "../../../takomo-aws-model"
import { evaluateRules, Rule } from "../../../utils/rules"

export type DescribeChangeSetResult =
  | "PENDING"
  | "READY"
  | "NO_CHANGES"
  | "FAILED"
  | "ERROR"

type DescribeChangeSetRuleRule = Rule<ChangeSet, DescribeChangeSetResult>

export const changeSetReadyRule: DescribeChangeSetRuleRule = ({
  status,
}: ChangeSet) => (status === "CREATE_COMPLETE" ? "READY" : undefined)

export const changeSetPendingRule: DescribeChangeSetRuleRule = ({
  status,
}: ChangeSet) =>
  status === "CREATE_IN_PROGRESS" || status === "CREATE_PENDING"
    ? "PENDING"
    : undefined

export const changeSetFailedRule: DescribeChangeSetRuleRule = ({
  status,
}: ChangeSet) => (status === "FAILED" ? "FAILED" : undefined)

export const changeSetNoChangesRule: DescribeChangeSetRuleRule = ({
  status,
  statusReason,
}: ChangeSet) => {
  if (status !== "FAILED") {
    return undefined
  }

  const text1 = "The submitted information didn't contain changes"
  const text2 = "No updates are to be performed"
  return statusReason.startsWith(text1) || statusReason.startsWith(text2)
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
  changeSet: ChangeSet,
): DescribeChangeSetResult => evaluateRules(rules, changeSet, () => "ERROR")
