import { HookOperation, StackOperationType } from "@takomo/stacks-model"
import { toHookOperation } from "../../../src/stacks/common/hooks"

const cases: Array<[StackOperationType, HookOperation]> = [
  ["CREATE", "create"],
  ["RECREATE", "create"],
  ["UPDATE", "update"],
]

describe("#toHookOperation", () => {
  test.each(cases)("when %s is given returns %s", (status, expected) => {
    expect(toHookOperation(status)).toBe(expected)
  })
})
