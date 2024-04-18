import { evaluateRules, Rule } from "../../../utils/rules.js"
import { ChangeSet } from "../model.js"
import { ChangeSetStatus } from "@aws-sdk/client-cloudformation"

export type DescribeChangeSetResult =
  | "PENDING"
  | "READY"
  | "NO_CHANGES"
  | "FAILED"
  | "ERROR"

type DescribeChangeSetRuleRule = Rule<ChangeSet, DescribeChangeSetResult>

export const changeSetReadyRule: DescribeChangeSetRuleRule = ({
  status,
}: ChangeSet) =>
  status === ChangeSetStatus.CREATE_COMPLETE ? "READY" : undefined

export const changeSetPendingRule: DescribeChangeSetRuleRule = ({
  status,
}: ChangeSet) =>
  status === ChangeSetStatus.CREATE_IN_PROGRESS ||
  status === ChangeSetStatus.CREATE_PENDING
    ? "PENDING"
    : undefined

export const changeSetFailedRule: DescribeChangeSetRuleRule = ({
  status,
}: ChangeSet) => (status === ChangeSetStatus.FAILED ? "FAILED" : undefined)

export const changeSetNoChangesRule: DescribeChangeSetRuleRule = (
  cs: ChangeSet,
) => {
  const { status, statusReason } = cs

  if (status !== ChangeSetStatus.FAILED) {
    return undefined
  }

  const text1 = "The submitted information didn't contain changes"
  const text2 = "No updates are to be performed"

  return statusReason === undefined ||
    statusReason.startsWith(text1) ||
    statusReason.startsWith(text2)
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
