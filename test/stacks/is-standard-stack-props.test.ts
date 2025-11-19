import { mock } from "jest-mock-extended"
import { isStandardStackProps } from "../../src/stacks/standard-stack.js"
import { CustomStackProps } from "../../src/stacks/custom-stack.js"
import { StackProps } from "../../src/stacks/stack.js"

describe("isStandardStackProps", () => {
  test("returns false for props with customType property", () => {
    const props = mock<StackProps>({})
    expect(isStandardStackProps(props)).toBe(true)
  })

  test("returns true for props without customType property", () => {
    const props = mock<CustomStackProps>({ customType: "custom-type" })
    expect(isStandardStackProps(props)).toBe(false)
  })
})
