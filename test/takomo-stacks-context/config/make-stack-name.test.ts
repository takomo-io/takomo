import { makeStackName } from "../../../src/takomo-stacks-context/config/make-stack-name.js"

describe("#makeStackName", () => {
  test("without project", () => {
    expect(makeStackName("/path/to/stack.yml", undefined)).toEqual(
      "path-to-stack",
    )
  })

  test("with project", () => {
    expect(makeStackName("/another/stack.yml", "example")).toEqual(
      "example-another-stack",
    )
  })
})
