import { StackOperationType } from "../../../../src/command/command-model.js"
import { toHookOperation } from "../../../../src/command/stacks/common/hooks.js"
import { HookOperation } from "../../../../src/index.js"

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
