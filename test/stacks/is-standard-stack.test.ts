import { mock } from "jest-mock-extended"
import { isStandardStack } from "../../src/stacks/standard-stack.js"
import { Stack } from "../../src/stacks/stack.js"
import { CustomStack } from "../../src/stacks/custom-stack.js"

describe("isStandardStack", () => {
  test("returns false for stack with customType property", () => {
    const stack = mock<Stack>({})
    expect(isStandardStack(stack)).toBe(true)
  })

  test("returns true for stack without customType property", () => {
    const stack = mock<CustomStack>({ customType: "custom-type" })
    expect(isStandardStack(stack)).toBe(false)
  })
})
