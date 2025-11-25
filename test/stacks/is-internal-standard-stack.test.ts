import { mock } from "jest-mock-extended"
import { isInternalStandardStack } from "../../src/stacks/standard-stack.js"
import { InternalStack } from "../../src/stacks/stack.js"
import { InternalCustomStack } from "../../src/stacks/custom-stack.js"

describe("isInternalStandardStack", () => {
  test("returns false for stack with customType property", () => {
    const stack = mock<InternalStack>({})
    expect(isInternalStandardStack(stack)).toBe(true)
  })

  test("returns true for stack without customType property", () => {
    const stack = mock<InternalCustomStack>({ customType: "custom-type" })
    expect(isInternalStandardStack(stack)).toBe(false)
  })
})
