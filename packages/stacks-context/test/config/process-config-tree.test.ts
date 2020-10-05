import { CommandPath, Constants, Options } from "@takomo/core"
import { Stack, StackGroup } from "@takomo/stacks-model"
import {
  coreResolverProviders,
  ResolverRegistry,
} from "@takomo/stacks-resolvers"
import { ConsoleLogger, LogLevel, TemplateEngine } from "@takomo/util"
import * as path from "path"
import { processConfigTree } from "../../src/config/process-config-tree"
import { buildConfigTree } from "../../src/config/tree/build-config-tree"
import { mockTakomoCredentialProvider } from "../mocks"

const options = new Options({
  stats: false,
  projectDir: "",
  autoConfirm: true,
  logConfidentialInfo: false,
  logLevel: LogLevel.DEBUG,
})

const byName = (a: StackGroup, b: StackGroup) =>
  a.getName().localeCompare(b.getName())

const byStackName = (a: Stack, b: Stack) =>
  a.getName().localeCompare(b.getName())

const byStackPath = (a: Stack, b: Stack) =>
  a.getPath().localeCompare(b.getPath())

const byRegion = (a: Stack, b: Stack) =>
  a.getRegion().localeCompare(b.getRegion())

const logger = new ConsoleLogger(options.getLogLevel())

const resolverRegistry = new ResolverRegistry(logger)

coreResolverProviders().forEach((p) =>
  resolverRegistry.registerBuiltInProvider(p),
)

const doProcessConfigTree = async (
  configsDir: string,
  commandPath: CommandPath = Constants.ROOT_STACK_GROUP_PATH,
): Promise<StackGroup> =>
  buildConfigTree(
    logger,
    path.join(
      process.cwd(),
      "test",
      "config",
      "test-files",
      configsDir,
      "stacks",
    ),
    Constants.ROOT_STACK_GROUP_PATH,
  ).then((configTree) =>
    processConfigTree(
      logger,
      mockTakomoCredentialProvider(),
      new Map(),
      resolverRegistry,
      new Map(),
      options,
      { var: {}, env: {}, context: { projectDir: "" } },
      new TemplateEngine(),
      commandPath,
      configTree,
    ),
  )

describe("#processConfigTree", () => {
  describe("returns a correctly build hierarchy", () => {
    test("when an empty stacks dir is given", async () => {
      const root = await doProcessConfigTree("empty")
      expect(root.getPath()).toBe("/")
      expect(root.getChildren()).toHaveLength(0)
    })

    test("when an empty stacks dir with only a root stack group config is given", async () => {
      const root = await doProcessConfigTree("just-root-config")
      expect(root.getPath()).toBe("/")
      expect(root.getChildren()).toHaveLength(0)
      expect(root.getRegions()).toStrictEqual(["us-east-1", "eu-central-1"])
    })

    test("when stacks dir with nested groups and stacks is given", async () => {
      const root = await doProcessConfigTree("example")
      const children = root.getChildren().sort(byName)
      const childNames = children.map((c) => c.getName())

      expect(childNames).toStrictEqual(["database", "logs", "network", "s3"])

      const [database, logs, network, s3] = children

      expect(database.getStacks()).toHaveLength(1)
      const [rds1] = database.getStacks()
      expect(rds1.getPath()).toBe("/database/rds.yml/eu-north-1")
      expect(rds1.getRegion()).toBe("eu-north-1")

      expect(logs.getChildren()).toHaveLength(2)
      expect(logs.getStacks()).toHaveLength(0)

      expect(network.getChildren()).toHaveLength(0)
      expect(network.getStacks()).toHaveLength(3)

      const [sgs, subnets, vpc] = network.getStacks().sort(byStackPath)

      expect(sgs.getTemplate()).toBe("security-groups.yml")
      expect(subnets.getTemplate()).toBe("network/subnets.json")
      expect(vpc.getTemplate()).toBe("network/vpc.yml")

      expect(s3.isIgnored()).toBeTruthy()
      expect(s3.getChildren()).toHaveLength(0)
      expect(s3.getStacks()).toHaveLength(0)
    })

    test("when a hierarchy with different regions is given", async () => {
      const root = await doProcessConfigTree("regions")
      expect(root.getRegions()).toStrictEqual(["eu-west-1", "eu-central-1"])

      const [aaa, bbb] = root.getChildren().sort(byName)
      expect(aaa.getRegions()).toStrictEqual(["eu-west-1", "eu-central-1"])
      expect(bbb.getRegions()).toStrictEqual(["us-east-1"])

      const aaaStacks = aaa.getStacks().sort(byStackPath)
      expect(aaaStacks.length).toBe(3)

      const [stack3a, stack3b, stack4] = aaaStacks
      expect(stack3a.getRegion()).toBe("eu-central-1")
      expect(stack3b.getRegion()).toBe("eu-west-1")
      expect(stack4.getRegion()).toBe("us-west-1")

      const bbbStacks = bbb.getStacks().sort(byStackPath)
      expect(bbbStacks.length).toBe(2)

      const [stack1, stack2] = bbbStacks
      expect(stack1.getRegion()).toBe("eu-north-1")
      expect(stack2.getRegion()).toBe("us-east-1")
    })

    test("when a hierarchy with different account ids is given", async () => {
      const root = await doProcessConfigTree("account-ids")
      expect(root.getAccountIds()).toStrictEqual(["999999999999"])

      const [x, y] = root.getChildren().sort(byName)
      expect(x.getAccountIds()).toStrictEqual(["123456789012"])
      expect(y.getAccountIds()).toStrictEqual(["999999999999"])

      const [stackA] = x.getStacks().sort(byRegion)

      expect(stackA.getAccountIds()).toStrictEqual(["123456789012"])

      const [stackB, stackC] = y.getStacks().sort(byStackPath)

      expect(stackB.getAccountIds()).toStrictEqual(["888888888888"])
      expect(stackC.getAccountIds()).toStrictEqual(["999999999999"])
    })

    describe("when a hierarchy with dependencies between stacks is given", () => {
      test("and default command path is used", async () => {
        const root = await doProcessConfigTree("dependencies")
        const [sg, vpc] = root.getStacks().sort(byStackName)

        expect(sg.getPath()).toBe("/sg.yml/eu-west-1")
        expect(vpc.getPath()).toBe("/vpc.yml/eu-west-1")
      })

      test("and '/sg.yml' command path is used", async () => {
        const root = await doProcessConfigTree("dependencies", "/sg.yml")
        const stacks = root.getStacks().sort(byStackName)
        expect(stacks).toHaveLength(2)

        const [sg, vpc] = stacks

        expect(sg.getPath()).toBe("/sg.yml/eu-west-1")
        expect(vpc.getPath()).toBe("/vpc.yml/eu-west-1")
      })

      test("and '/vpc.yml' command path is used", async () => {
        const root = await doProcessConfigTree("dependencies", "/vpc.yml")
        const stacks = root.getStacks().sort(byStackName)
        expect(stacks).toHaveLength(1)

        const [vpc] = stacks

        expect(vpc.getPath()).toBe("/vpc.yml/eu-west-1")
      })
    })

    describe("when a hierarchy with resolver dependencies between stacks is given", () => {
      test("and default command path is used", async () => {
        const root = await doProcessConfigTree("resolver-dependencies")
        const [sg, vpc] = root.getStacks().sort(byStackName)

        expect(sg.getPath()).toBe("/sg.yml/eu-west-1")
        expect(vpc.getPath()).toBe("/vpc.yml/eu-west-1")
      })

      test("and '/sg.yml' command path is used", async () => {
        const root = await doProcessConfigTree(
          "resolver-dependencies",
          "/sg.yml",
        )
        const stacks = root.getStacks().sort(byStackName)
        expect(stacks).toHaveLength(2)

        const [sg, vpc] = stacks

        expect(sg.getPath()).toBe("/sg.yml/eu-west-1")
        expect(vpc.getPath()).toBe("/vpc.yml/eu-west-1")
      })

      test("and '/vpc.yml' command path is used", async () => {
        const root = await doProcessConfigTree(
          "resolver-dependencies",
          "/vpc.yml",
        )
        const stacks = root.getStacks().sort(byStackName)
        expect(stacks).toHaveLength(1)

        const [vpc] = stacks

        expect(vpc.getPath()).toBe("/vpc.yml/eu-west-1")
      })
    })
  })
})
