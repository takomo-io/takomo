import { toHookOperation } from "../../../../src/takomo-stacks-commands/stacks/common/hooks"
import {
  HookOperation,
  StackOperationType,
} from "../../../../src/takomo-stacks-model"

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
