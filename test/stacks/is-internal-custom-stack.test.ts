import { mock } from "jest-mock-extended"
import {
  InternalCustomStack,
  isInternalCustomStack,
} from "../../src/stacks/custom-stack.js"
import { InternalStack } from "../../src/stacks/stack.js"

describe("isInternalCustomStack", () => {
  test("returns false for stack without customType property", () => {
    const stack = mock<InternalStack>({})
    expect(isInternalCustomStack(stack)).toBe(false)
  })

  test("returns true for stack with customType property", () => {
    const stack = mock<InternalCustomStack>({ customType: "custom-type" })
    expect(isInternalCustomStack(stack)).toBe(true)
  })
})
