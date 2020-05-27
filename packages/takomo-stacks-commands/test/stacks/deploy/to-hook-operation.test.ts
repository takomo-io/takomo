import { StackLaunchType } from "@takomo/stacks-model"
import { toHookOperation } from "../../../src/stacks/deploy/hooks"

describe("#toHookOperation", () => {
  describe("returns correct value", () => {
    test("when is StackLaunchType.CREATE given", () => {
      expect(toHookOperation(StackLaunchType.CREATE)).toBe("create")
    })
    test("when is StackLaunchType.RECREATE given", () => {
      expect(toHookOperation(StackLaunchType.RECREATE)).toBe("create")
    })
    test("when is StackLaunchType.UPDATE given", () => {
      expect(toHookOperation(StackLaunchType.UPDATE)).toBe("update")
    })
  })
})
