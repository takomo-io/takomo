import { isStackReadyForLaunch } from "../../../../src/command/stacks/deploy/validate"

const data: Array<[string, boolean]> = [
  ["CREATE_IN_PROGRESS", false],
  ["CREATE_FAILED", false],
  ["CREATE_COMPLETE", true],
  ["ROLLBACK_IN_PROGRESS", false],
  ["ROLLBACK_FAILED", false],
  ["ROLLBACK_COMPLETE", false],
  ["DELETE_IN_PROGRESS", false],
  ["DELETE_FAILED", false],
  ["DELETE_COMPLETE", false],
  ["UPDATE_IN_PROGRESS", false],
  ["UPDATE_COMPLETE_CLEANUP_IN_PROGRESS", false],
  ["UPDATE_COMPLETE", true],
  ["UPDATE_ROLLBACK_IN_PROGRESS", false],
  ["UPDATE_ROLLBACK_FAILED", false],
  ["UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS", false],
  ["UPDATE_ROLLBACK_COMPLETE", true],
  ["REVIEW_IN_PROGRESS", true],
]

describe("is stack status valid for launch", () => {
  describe.each(data)("when %s is given", (status, expected) => {
    test(`returns ${expected}`, () => {
      expect(isStackReadyForLaunch(status)).toBe(expected)
    })
  })
})
