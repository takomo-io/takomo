import { StackStatus } from "../../src/aws/cloudformation/model.js"
import { resolveOperationType } from "../../src/command/stacks/deploy/plan.js"

const notSupported: Array<StackStatus> = [
  "CREATE_IN_PROGRESS",
  "ROLLBACK_IN_PROGRESS",
  "DELETE_IN_PROGRESS",
  "DELETE_FAILED",
  "DELETE_COMPLETE",
  "UPDATE_IN_PROGRESS",
  "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS",
  "UPDATE_ROLLBACK_IN_PROGRESS",
  "UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS",
]

describe("#resolveOperationType", () => {
  describe.each(notSupported)("when %s is given", (status) => {
    test("throws an error", () => {
      expect(() => resolveOperationType(status)).toThrow(
        `Unsupported stack status: ${status}`,
      )
    })
  })

  test("when CREATE_FAILED is given returns RECREATE", () => {
    expect(resolveOperationType("CREATE_FAILED")).toBe("RECREATE")
  })

  test("when CREATE_COMPLETE is given returns UPDATE", () => {
    expect(resolveOperationType("CREATE_COMPLETE")).toBe("UPDATE")
  })

  test("when ROLLBACK_COMPLETE is given returns RECREATE", () => {
    expect(resolveOperationType("ROLLBACK_COMPLETE")).toBe("RECREATE")
  })

  test("when UPDATE_COMPLETE is given returns UPDATE", () => {
    expect(resolveOperationType("UPDATE_COMPLETE")).toBe("UPDATE")
  })

  test("when UPDATE_ROLLBACK_COMPLETE is given returns UPDATE", () => {
    expect(resolveOperationType("UPDATE_ROLLBACK_COMPLETE")).toBe("UPDATE")
  })

  test("when UPDATE_ROLLBACK_FAILED is given returns UPDATE", () => {
    expect(resolveOperationType("UPDATE_ROLLBACK_FAILED")).toBe("UPDATE")
  })

  test("when IMPORT_COMPLETE is given returns UPDATE", () => {
    expect(resolveOperationType("IMPORT_COMPLETE")).toBe("UPDATE")
  })

  test("when REVIEW_IN_PROGRESS is given returns RECREATE", () => {
    expect(resolveOperationType("REVIEW_IN_PROGRESS")).toBe("RECREATE")
  })

  test("when ROLLBACK_FAILED is given returns RECREATE", () => {
    expect(resolveOperationType("ROLLBACK_FAILED")).toBe("RECREATE")
  })
})
