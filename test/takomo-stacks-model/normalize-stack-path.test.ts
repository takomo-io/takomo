import { normalizeStackPath } from "../../src/takomo-stacks-model"

const cases = [
  ["/", "/stack.yml", "/stack.yml"],
  ["/", "hello.yml", "/hello.yml"],
  ["/networking", "sibling.yml", "/networking/sibling.yml"],
  ["/parent", "../root-child.yml", "/root-child.yml"],
  ["/foo", "bar/baz/child.yml", "/foo/bar/baz/child.yml"],
  ["/parent/example", "../child.yml", "/parent/child.yml"],
  ["/parent/example", "../child.yml/us-east-1", "/parent/child.yml/us-east-1"],
  ["/parent/example", "../../child.yml", "/child.yml"],
  ["/parent/example", "../../hello/world/child.yml", "/hello/world/child.yml"],
  [
    "/parent/example",
    "../hello/world/child.yml",
    "/parent/hello/world/child.yml",
  ],
]

describe("#normalizeStackPath", () => {
  test.each(cases)(
    "when given parent %s and stack path %s it returns %s",
    (parent, stackPath, expected) => {
      expect(normalizeStackPath(parent, stackPath)).toStrictEqual(expected)
    },
  )

  it("throws an error if traversed below the root level", () => {
    expect(() => normalizeStackPath("/parent", "../../hello.yml")).toThrow("s")
  })
})
