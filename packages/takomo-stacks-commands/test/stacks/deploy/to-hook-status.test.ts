import { CommandStatus } from "@takomo/core"
import { toHookStatus } from "../../../src/stacks/deploy/hooks"

describe("#toHookStatus", () => {
  describe("returns correct value", () => {
    test("when is CommandStatus.CANCELLED given", () => {
      expect(toHookStatus(CommandStatus.CANCELLED)).toBe("cancelled")
    })
    test("when is CommandStatus.SKIPPED given", () => {
      expect(toHookStatus(CommandStatus.SKIPPED)).toBe("skipped")
    })
    test("when is CommandStatus.SUCCESS given", () => {
      expect(toHookStatus(CommandStatus.SUCCESS)).toBe("success")
    })
    test("when is CommandStatus.FAILED given", () => {
      expect(toHookStatus(CommandStatus.FAILED)).toBe("failed")
    })
  })
})
