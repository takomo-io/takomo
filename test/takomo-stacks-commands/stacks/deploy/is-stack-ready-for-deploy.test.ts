import { StackStatus } from "../../../../src/takomo-aws-model"
import { isStackReadyForDeploy } from "../../../../src/takomo-stacks-commands/stacks/deploy/validate"

const data: Array<[StackStatus, boolean]> = [
  ["CREATE_IN_PROGRESS", false],
  ["CREATE_FAILED", true],
  ["CREATE_COMPLETE", true],
  ["ROLLBACK_IN_PROGRESS", false],
  ["ROLLBACK_FAILED", true],
  ["ROLLBACK_COMPLETE", true],
  ["DELETE_IN_PROGRESS", false],
  ["DELETE_FAILED", false],
  ["DELETE_COMPLETE", false],
  ["UPDATE_IN_PROGRESS", false],
  ["UPDATE_COMPLETE_CLEANUP_IN_PROGRESS", false],
  ["UPDATE_COMPLETE", true],
  ["UPDATE_ROLLBACK_IN_PROGRESS", false],
  ["UPDATE_ROLLBACK_FAILED", true],
  ["UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS", false],
  ["UPDATE_ROLLBACK_COMPLETE", true],
  ["REVIEW_IN_PROGRESS", true],
  ["IMPORT_COMPLETE", true],
  ["IMPORT_ROLLBACK_COMPLETE", true],
  ["IMPORT_ROLLBACK_IN_PROGRESS", false],
  ["IMPORT_IN_PROGRESS", false],
  ["IMPORT_ROLLBACK_FAILED", false],
]

describe("#isStackReadyForDeploy", () => {
  test.each(data)("when %s is given returns %s", (status, expected) => {
    expect(isStackReadyForDeploy(status)).toBe(expected)
  })
})
