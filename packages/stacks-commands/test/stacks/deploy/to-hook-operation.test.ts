import { HookOperation } from "@takomo/stacks-model"
import { StackDeployOperationType } from "../../../src"
import { toHookOperation } from "../../../src/stacks/common/hooks"

const cases: Array<[StackDeployOperationType, HookOperation]> = [
  ["CREATE", "create"],
  ["RECREATE", "create"],
  ["UPDATE", "update"],
]

describe("#toHookOperation", () => {
  test.each(cases)("when %s is given returns %s", (status, expected) => {
    expect(toHookOperation(status)).toBe(expected)
  })
})
