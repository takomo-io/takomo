import { Options } from "@takomo/core"
import { ConsoleLogger, LogLevel, TemplateEngine } from "@takomo/util"
import { buildStackGroup } from "../../../../src/context/config/build"
import { Stack, StackGroup } from "../../../../src/model"
import { mockTakomoCredentialProvider } from "../../../mocks"

const options = new Options({
  stats: false,
  projectDir: "",
  autoConfirm: true,
  logConfidentialInfo: false,
  logLevel: LogLevel.DEBUG,
})

const pathToConfigsDir = `${process.cwd()}/test/context/config/build/config`

const byName = (a: StackGroup, b: StackGroup) =>
  a.getName().localeCompare(b.getName())

const byStackPath = (a: Stack, b: Stack) =>
  a.getPath().localeCompare(b.getPath())

const byRegion = (a: Stack, b: Stack) =>
  a.getRegion().localeCompare(b.getRegion())

const build = (dirPath: string): Promise<StackGroup> =>
  buildStackGroup(
    new ConsoleLogger(options.getLogLevel()),
    mockTakomoCredentialProvider(),
    new Map(),
    new Map(),
    new Map(),
    options,
    { var: {}, env: {}, context: { projectDir: "" } },
    `${pathToConfigsDir}/${dirPath}`,
    null,
    new TemplateEngine(),
  )

describe("#buildStackGroup", () => {
  describe("from an empty stacks dir", () => {
    test("returns correct stack group", async () => {
      const root = await build("empty")
      expect(root.getPath()).toBe("/")
      expect(root.getChildren()).toHaveLength(0)
    })
  })

  describe("from an empty stacks dir with only a root stack group config", () => {
    test("returns correct stack group", async () => {
      const root = await build(`just-root-config`)
      expect(root.getPath()).toBe("/")
      expect(root.getChildren()).toHaveLength(0)
      expect(root.getRegions()).toStrictEqual(["us-east-1", "eu-central-1"])
    })
  })

  describe("from stacks dir with nested groups and stacks", () => {
    test("returns correctly build hierarchy", async () => {
      const root = await build(`example`)
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
  })

  describe("from hierarchy with different regions", () => {
    test("returns correctly build hierarchy", async () => {
      const root = await build(`regions`)
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
  })

  describe("from hierarchy with different account ids", () => {
    test("returns correctly build hierarchy", async () => {
      const root = await build(`account-ids`)
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
  })
})
