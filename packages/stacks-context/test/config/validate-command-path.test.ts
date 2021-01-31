import { ConfigTree } from "../../src"
import { validateCommandPath } from "../../src/config/build-stacks-context"

const tree: ConfigTree = {
  rootStackGroup: {
    path: "/",
    name: "/",
    children: [
      {
        path: "/dev",
        children: [],
        getConfig: jest.fn(),
        name: "dev",
        parentPath: undefined,
        // dir: {
        //   basename: "dev",
        //   fullPath: "/tmp/dev",
        // },
        stacks: [
          {
            path: "/dev/stack-x.yml",
            getConfig: jest.fn(),
            // file: {
            //   fullPath: "/tmp/dev/stack-x.yml",
            //   basename: "stack-x.yml",
            // },
          },
        ],
      },
    ],
    // dir: {
    //   basename: "tmp",
    //   fullPath: "/tmp",
    // },
    getConfig: jest.fn(),
    stacks: [
      {
        path: "/stack-a.yml",
        // file: {
        //   fullPath: "/tmp/stack-a.yml",
        //   basename: "stack-a.yml",
        // },
        getConfig: jest.fn(),
      },
    ],
  },
}

describe("#validateCommandPath", () => {
  describe("does not throw an error", () => {
    test("when the command path is omitted", () => {
      validateCommandPath(tree)
    })
    test("when the root command path is given", () => {
      validateCommandPath(tree, "/")
    })
    test("when the command path refers to an existing stack", () => {
      validateCommandPath(tree, "/stack-a.yml")
    })
    test("when the command path refers to an existing stack under stack group", () => {
      validateCommandPath(tree, "/dev/stack-x.yml")
    })
    test("when the command path refers to an existing stack group", () => {
      validateCommandPath(tree, "/dev")
    })
  })
  describe("throws an error", () => {
    const expectedError = (commandPath: string): string =>
      `No stacks found within the given command path: ${commandPath}\n\n` +
      "Available stack paths:\n\n" +
      "  - /stack-a.yml\n" +
      "  - /dev/stack-x.yml"

    test("when the command path refers to a non-existing stack ", () => {
      expect(() => validateCommandPath(tree, "/db.yml")).toThrow(
        expectedError("/db.yml"),
      )
    })
    test("when the command path refers to a non-existing stack under stack group", () => {
      expect(() => validateCommandPath(tree, "/dev/stack-y.yml")).toThrow(
        expectedError("/dev/stack-y.yml"),
      )
    })
    test("when the command path refers to a non-existing stack group", () => {
      expect(() => validateCommandPath(tree, "/test")).toThrow(
        expectedError("/test"),
      )
    })
  })
})
