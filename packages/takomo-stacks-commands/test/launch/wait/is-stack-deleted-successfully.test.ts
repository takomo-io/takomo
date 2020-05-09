import { isStackDeletedSuccessfully } from "../../../src/stacks/deploy/wait"

const data: Array<[string, boolean]> = [
  ["CREATE_IN_PROGRESS", false],
  ["CREATE_FAILED", false],
  ["CREATE_COMPLETE", false],
  ["ROLLBACK_IN_PROGRESS", false],
  ["ROLLBACK_FAILED", false],
  ["ROLLBACK_COMPLETE", false],
  ["DELETE_IN_PROGRESS", false],
  ["DELETE_FAILED", false],
  ["DELETE_COMPLETE", true],
  ["UPDATE_IN_PROGRESS", false],
  ["UPDATE_COMPLETE_CLEANUP_IN_PROGRESS", false],
  ["UPDATE_COMPLETE", false],
  ["UPDATE_ROLLBACK_IN_PROGRESS", false],
  ["UPDATE_ROLLBACK_FAILED", false],
  ["UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS", false],
  ["UPDATE_ROLLBACK_COMPLETE", false],
  ["REVIEW_IN_PROGRESS", false],
]

describe("has previous stack creation failed", () => {
  describe.each(data)("when %s is given", (status, expected) => {
    test(`returns ${expected}`, () => {
      expect(isStackDeletedSuccessfully(status)).toBe(expected)
    })
  })
})
