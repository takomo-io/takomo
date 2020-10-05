import { ConsoleLogger } from "@takomo/util"
import path from "path"
import { buildConfigTree } from "../../src/config/tree/build-config-tree"

const stacksDir = (dir: string): string =>
  path.join(process.cwd(), "test", "test-files", dir, "stacks")

const logger = new ConsoleLogger()

describe("#buildConfigTree", () => {
  describe("returns correct tree", () => {
    test("no files are given", async () => {
      const tree = await buildConfigTree(logger, stacksDir("01"), "/")
      expect(tree).toStrictEqual({
        rootStackGroup: {
          path: "/",
          parentPath: undefined,
          children: [],
          stacks: [],
          file: undefined,
          dir: {
            basename: "stacks",
            fullPath: path.join(stacksDir("01")),
          },
        },
      })
    })

    test("when a root stack group config file is given", async () => {
      const tree = await buildConfigTree(logger, stacksDir("02"), "/")
      expect(tree).toStrictEqual({
        rootStackGroup: {
          path: "/",
          parentPath: undefined,
          children: [],
          stacks: [],
          file: {
            basename: "config.yml",
            fullPath: path.join(stacksDir("02"), "config.yml"),
          },
          dir: {
            basename: "stacks",
            fullPath: path.join(stacksDir("02")),
          },
        },
      })
    })

    test("when a root stack group file and stack config file are given", async () => {
      const tree = await buildConfigTree(logger, stacksDir("03"), "/")
      expect(tree).toStrictEqual({
        rootStackGroup: {
          path: "/",
          parentPath: undefined,
          children: [],
          stacks: [
            {
              path: "/stack-a.yml",
              file: {
                basename: "stack-a.yml",
                fullPath: path.join(stacksDir("03"), "stack-a.yml"),
              },
            },
          ],
          file: {
            basename: "config.yml",
            fullPath: path.join(stacksDir("03"), "config.yml"),
          },
          dir: {
            basename: "stacks",
            fullPath: path.join(stacksDir("03")),
          },
        },
      })
    })

    test("when nested stack groups are given", async () => {
      const tree = await buildConfigTree(logger, stacksDir("04"), "/")
      expect(tree).toStrictEqual({
        rootStackGroup: {
          path: "/",
          parentPath: undefined,
          children: [
            {
              path: "/dev",
              parentPath: "/",
              children: [
                {
                  path: "/dev/web",
                  parentPath: "/dev",
                  children: [],
                  stacks: [],
                  file: undefined,
                  dir: {
                    basename: "web",
                    fullPath: path.join(stacksDir("04"), "dev", "web"),
                  },
                },
              ],
              stacks: [],
              file: undefined,
              dir: {
                basename: "dev",
                fullPath: path.join(stacksDir("04"), "dev"),
              },
            },
            {
              path: "/prod",
              parentPath: "/",
              children: [],
              stacks: [],
              file: undefined,
              dir: {
                basename: "prod",
                fullPath: path.join(stacksDir("04"), "prod"),
              },
            },
          ],
          stacks: [],
          file: undefined,
          dir: {
            basename: "stacks",
            fullPath: path.join(stacksDir("04")),
          },
        },
      })
    })

    test("when a complex hierarchy is given", async () => {
      const tree = await buildConfigTree(logger, stacksDir("05"), "/")
      expect(tree).toStrictEqual({
        rootStackGroup: {
          path: "/",
          parentPath: undefined,
          children: [
            {
              path: "/dev",
              parentPath: "/",
              children: [
                {
                  path: "/dev/app",
                  parentPath: "/dev",
                  children: [],
                  stacks: [],
                  dir: {
                    basename: "app",
                    fullPath: path.join(stacksDir("05"), "dev", "app"),
                  },
                  file: {
                    basename: "config.yml",
                    fullPath: path.join(
                      stacksDir("05"),
                      "dev",
                      "app",
                      "config.yml",
                    ),
                  },
                },
              ],
              stacks: [
                {
                  path: "/dev/stack-a.yml",
                  file: {
                    basename: "stack-a.yml",
                    fullPath: path.join(stacksDir("05"), "dev", "stack-a.yml"),
                  },
                },
              ],
              file: undefined,
              dir: {
                basename: "dev",
                fullPath: path.join(stacksDir("05"), "dev"),
              },
            },
            {
              path: "/test",
              parentPath: "/",
              children: [],
              stacks: [],
              file: {
                basename: "config.yml",
                fullPath: path.join(stacksDir("05"), "test", "config.yml"),
              },
              dir: {
                basename: "test",
                fullPath: path.join(stacksDir("05"), "test"),
              },
            },
          ],
          stacks: [],
          file: undefined,
          dir: {
            basename: "stacks",
            fullPath: path.join(stacksDir("05")),
          },
        },
      })
    })
  })
})
