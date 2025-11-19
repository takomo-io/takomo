import { mock } from "jest-mock-extended"
import {
  CustomStackProps,
  isCustomStackProps,
} from "../../src/stacks/custom-stack.js"
import { StackProps } from "../../src/stacks/stack.js"

describe("isCustomStackProps", () => {
  test("returns false for stack without customType property", () => {
    const stack = mock<StackProps>({})
    expect(isCustomStackProps(stack)).toBe(false)
  })

  test("returns true for stack with customType property", () => {
    const stack = mock<CustomStackProps>({ customType: "custom-type" })
    expect(isCustomStackProps(stack)).toBe(true)
  })
})
