import { StackLaunchType } from "@takomo/stacks-model"
import { resolveStackLaunchType } from "../src"

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

describe("#resolveStackLaunchType", () => {
  describe.each(notSupported)("when %s is given", (status) => {
    test("throws an error", () => {
      expect(() => resolveStackLaunchType(status)).toThrow(
        `Unsupported stack status: ${status}`,
      )
    })
  })

  test("when CREATE_FAILED is given returns RECREATE", () => {
    expect(resolveStackLaunchType("CREATE_FAILED")).toBe(
      StackLaunchType.RECREATE,
    )
  })

  test("when CREATE_COMPLETE is given returns UPDATE", () => {
    expect(resolveStackLaunchType("CREATE_COMPLETE")).toBe(
      StackLaunchType.UPDATE,
    )
  })

  test("when ROLLBACK_COMPLETE is given returns RECREATE", () => {
    expect(resolveStackLaunchType("ROLLBACK_COMPLETE")).toBe(
      StackLaunchType.RECREATE,
    )
  })

  test("when UPDATE_COMPLETE is given returns UPDATE", () => {
    expect(resolveStackLaunchType("UPDATE_COMPLETE")).toBe(
      StackLaunchType.UPDATE,
    )
  })

  test("when UPDATE_ROLLBACK_COMPLETE is given returns UPDATE", () => {
    expect(resolveStackLaunchType("UPDATE_ROLLBACK_COMPLETE")).toBe(
      StackLaunchType.UPDATE,
    )
  })

  test("when REVIEW_IN_PROGRESS is given returns RECREATE", () => {
    expect(resolveStackLaunchType("REVIEW_IN_PROGRESS")).toBe(
      StackLaunchType.RECREATE,
    )
  })
})
