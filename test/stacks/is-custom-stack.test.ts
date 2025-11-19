import { mock } from "jest-mock-extended"
import { CustomStack, isCustomStack } from "../../src/stacks/custom-stack.js"
import { Stack } from "../../src/stacks/stack.js"

describe("isCustomStack", () => {
  test("returns false for stack without customType property", () => {
    const stack = mock<Stack>({})
    expect(isCustomStack(stack)).toBe(false)
  })

  test("returns true for stack with customType property", () => {
    const stack = mock<CustomStack>({ customType: "custom-type" })
    expect(isCustomStack(stack)).toBe(true)
  })
})
