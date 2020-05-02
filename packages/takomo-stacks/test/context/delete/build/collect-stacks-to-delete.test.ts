import { CommandPath, Options, StackName } from "@takomo/core"
import {
  collectFromHierarchy,
  ConsoleLogger,
  LogLevel,
  TemplateEngine,
} from "@takomo/util"
import { ConfigContext } from "../../../../src/context/config"
import { collectStacksToDelete } from "../../../../src/context/delete/build"
import { StackGroup } from "../../../../src/model"
import { createStack, createStackGroup } from "../../../helpers"
import { mockTakomoCredentialProvider } from "../../../mocks"

const configContext = (rootStackGroup: StackGroup): ConfigContext => {
  const allStackGroups = collectFromHierarchy(rootStackGroup, n =>
    n.getChildren(),
  )
  const stackGroups = new Map(allStackGroups.map(s => [s.getPath(), s]))
  const stackConfigsByPath = new Map()

  allStackGroups.forEach(sg => {
    sg.getStacks().forEach(s => {
      stackConfigsByPath.set(s.getPath(), s)
    })
  })

  return new ConfigContext({
    rootStackGroup,
    stackGroups,
    stackConfigsByPath,
    variables: {
      context: { projectDir: "" },
      var: {},
      env: {},
    },
    logger: new ConsoleLogger(),
    credentialProvider: mockTakomoCredentialProvider(),
    options: new Options({
      logLevel: LogLevel.INFO,
      logConfidentialInfo: false,
      autoConfirm: true,
      projectDir: "",
      stats: false,
    }),
    templateEngine: new TemplateEngine(),
  })
}

const collectStackNamesToDelete = (
  ctx: ConfigContext,
  commandPath: CommandPath,
  ignoreDependencies?: boolean,
): StackName[] =>
  collectStacksToDelete(ctx, commandPath, ignoreDependencies || false)
    .map(s => s.getName())
    .sort()

describe("#collectStacksToDelete", () => {
  describe("when context contains no stacks", () => {
    const root = createStackGroup({ path: "/", name: "/" })
    const ctx = configContext(root)

    describe("and root stack group is given as command path", () => {
      it("should return no stacks", () => {
        const stackNames = collectStackNamesToDelete(ctx, "/")
        expect(stackNames).toStrictEqual([])
      })
    })
  })

  describe("when context contains a single stack", () => {
    const ctx = configContext(
      createStackGroup({
        path: "/",
        name: "/",
        stacks: [createStack({ name: "vpc", path: "/vpc.yml/us-east-1" })],
      }),
    )
    describe("and root stack group is given as command path", () => {
      it("should return the single stack", () => {
        const stackNames = collectStackNamesToDelete(ctx, "/")
        expect(stackNames).toStrictEqual(["vpc"])
      })
    })
  })

  describe("when context contains three stacks", () => {
    const ctx = configContext(
      createStackGroup({
        path: "/",
        name: "/",
        stacks: [
          createStack({ name: "a", path: "/a.yml/us-east-1" }),
          createStack({ name: "b", path: "/b.yml/us-east-1" }),
          createStack({ name: "c", path: "/c.yml/us-east-1" }),
        ],
      }),
    )

    describe("and root stack group is given as command path", () => {
      it("should return all stacks", () => {
        const stackNames = collectStackNamesToDelete(ctx, "/")
        expect(stackNames).toStrictEqual(["a", "b", "c"])
      })
    })
    describe("and a stack path is given as command path", () => {
      it("should return only the matching stack", () => {
        const stackNames = collectStackNamesToDelete(ctx, "/b.yml")
        expect(stackNames).toStrictEqual(["b"])
      })
    })
    describe("and an exact stack path is given as command path", () => {
      it("should return only the matching stack", () => {
        const stackNames = collectStackNamesToDelete(ctx, "/c.yml/us-east-1")
        expect(stackNames).toStrictEqual(["c"])
      })
    })
  })

  describe("when context contains stacks in multiple stack groups", () => {
    const ctx = configContext(
      createStackGroup({
        path: "/",
        name: "/",
        stacks: [
          createStack({
            name: "stack1",
            path: "/stack1.yml/us-east-1",
          }),
        ],
        children: [
          createStackGroup({
            path: "/a",
            name: "a",
            stacks: [
              createStack({
                name: "stack2",
                path: "/a/stack2.yml/us-east-1",
              }),
              createStack({
                name: "stack3",
                path: "/a/stack3.yml/us-east-1",
              }),
            ],
          }),
          createStackGroup({
            path: "/b",
            name: "b",
            stacks: [
              createStack({
                name: "stack4",
                path: "/b/stack4.yml/us-east-1",
              }),
              createStack({
                name: "stack5",
                path: "/b/stack5.yml/us-east-1",
              }),
            ],
            children: [
              createStackGroup({
                path: "/b/c",
                name: "c",
                stacks: [
                  createStack({
                    name: "stack6",
                    path: "/b/c/stack6.yml/us-east-1",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    )

    describe("and root stack group is given as command path", () => {
      it("should return all stacks", () => {
        const stackNames = collectStackNamesToDelete(ctx, "/")
        expect(stackNames).toStrictEqual([
          "stack1",
          "stack2",
          "stack3",
          "stack4",
          "stack5",
          "stack6",
        ])
      })
    })
    describe("and a stack path is given as command path", () => {
      it("should return only the matching stack", () => {
        const stackNames = collectStackNamesToDelete(
          ctx,
          "/b/stack5.yml/us-east-1",
        )
        expect(stackNames).toStrictEqual(["stack5"])
      })
    })
    describe("and a stack group is given as command path", () => {
      it("should return the matching stacks", () => {
        const stackNames = collectStackNamesToDelete(ctx, "/b")
        expect(stackNames).toStrictEqual(["stack4", "stack5", "stack6"])
      })
    })
  })

  describe("when context contains stacks with dependencies", () => {
    const ctx = configContext(
      createStackGroup({
        path: "/",
        name: "/",
        stacks: [
          createStack({
            name: "a",
            path: "/a.yml/us-east-1",
            dependants: ["b"],
          }),
          createStack({
            name: "b",
            path: "/b.yml/us-east-1",
            dependencies: ["/a.yml/us-east-1"],
            dependants: ["/c.yml/us-east-1", "/e.yml/us-east-1"],
          }),
          createStack({
            name: "c",
            path: "/c.yml/us-east-1",
            dependencies: ["/b.yml/us-east-1"],
          }),
          createStack({
            name: "d",
            path: "/d.yml/us-east-1",
          }),
          createStack({
            name: "e",
            path: "/e.yml/us-east-1",
            dependencies: ["/b.yml/us-east-1"],
          }),
        ],
      }),
    )

    describe("and a stack path '/b.yml' is given as command path", () => {
      it("should return the matching stacks", () => {
        const stackNames = collectStackNamesToDelete(ctx, "/b.yml")
        expect(stackNames).toStrictEqual(["b", "c", "e"])
      })
    })

    describe("and a stack path '/b.yml' is given as command path", () => {
      describe("and dependencies are ignored", () => {
        it("should return only the matching stack", () => {
          const stackNames = collectStackNamesToDelete(ctx, "/b.yml", true)
          expect(stackNames).toStrictEqual(["b"])
        })
      })
    })

    describe("and a stack path '/c.yml' is given as command path", () => {
      it("should return the matching stacks", () => {
        const stackNames = collectStackNamesToDelete(ctx, "/c.yml")
        expect(stackNames).toStrictEqual(["c"])
      })
    })
  })
})
