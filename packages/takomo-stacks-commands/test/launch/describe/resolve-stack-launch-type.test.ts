import { resolveStackLaunchType } from "../../../src/stacks/deploy/describe"
import { StackLaunchType } from "../../../src/stacks/deploy/model"

const supported: Array<[string, StackLaunchType]> = [
  ["CREATE_FAILED", StackLaunchType.CREATE],
  ["CREATE_COMPLETE", StackLaunchType.UPDATE],
  ["ROLLBACK_COMPLETE", StackLaunchType.CREATE],
  ["UPDATE_COMPLETE", StackLaunchType.UPDATE],
  ["UPDATE_ROLLBACK_COMPLETE", StackLaunchType.UPDATE],
  ["REVIEW_IN_PROGRESS", StackLaunchType.CREATE],
]

const notSupported: Array<string> = [
  "CREATE_IN_PROGRESS",
  "ROLLBACK_IN_PROGRESS",
  "ROLLBACK_FAILED",
  "DELETE_IN_PROGRESS",
  "DELETE_FAILED",
  "DELETE_COMPLETE",
  "UPDATE_IN_PROGRESS",
  "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS",
  "UPDATE_ROLLBACK_IN_PROGRESS",
  "UPDATE_ROLLBACK_FAILED",
  "UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS",
]

describe("resolve stack launch type", () => {
  describe.each(supported)("when %s is given", (status, expected) => {
    test(`returns ${expected}`, () => {
      expect(resolveStackLaunchType(status)).toBe(expected)
    })
  })

  describe.each(notSupported)("when %s is given", (status) => {
    test("throws an error", () => {
      expect(() => resolveStackLaunchType(status)).toThrow(
        `Unsupported stack status: ${status}`,
      )
    })
  })
})
