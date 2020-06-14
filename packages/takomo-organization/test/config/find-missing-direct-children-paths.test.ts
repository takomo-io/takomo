import { findMissingDirectChildrenPaths } from "../../src/config/parser"

interface TestCase {
  childPaths: string[]
  expected: string[]
  depth: number
}

const cases: TestCase[] = [
  {
    childPaths: [],
    expected: [],
    depth: 1,
  },
  {
    childPaths: [
      "Root/WebProjects",
      "Root/WebProjects/Development",
      "Root/WebProjects/Production",
    ],
    expected: [],
    depth: 1,
  },
  {
    childPaths: ["Root/WebProjects/Development", "Root/WebProjects/Production"],
    expected: [],
    depth: 2,
  },
  {
    childPaths: ["Root/WebProjects/Development", "Root/WebProjects/Production"],
    expected: ["Root/WebProjects"],
    depth: 1,
  },
  {
    childPaths: ["Root/Example/Projects/Simple"],
    expected: ["Root/Example/Projects"],
    depth: 2,
  },
]

describe("#findMissingDirectChildrenPaths", () => {
  describe("returns correct paths", () => {
    test.each(cases)(
      "with case number %#",
      ({ childPaths, expected, depth }) => {
        expect(findMissingDirectChildrenPaths(childPaths, depth)).toStrictEqual(
          expected,
        )
      },
    )
  })
})
