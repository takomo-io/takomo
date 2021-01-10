import { toHookStatus } from "../../../src/stacks/common/hooks"

describe("#toHookStatus", () => {
  describe("returns correct value", () => {
    test("when is CommandStatus.CANCELLED given", () => {
      expect(toHookStatus("CANCELLED")).toBe("cancelled")
    })
    test("when is CommandStatus.SKIPPED given", () => {
      expect(toHookStatus("SKIPPED")).toBe("skipped")
    })
    test("when is CommandStatus.SUCCESS given", () => {
      expect(toHookStatus("SUCCESS")).toBe("success")
    })
    test("when is CommandStatus.FAILED given", () => {
      expect(toHookStatus("FAILED")).toBe("failed")
    })
  })
})
