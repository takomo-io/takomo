// import {
//   CommandPath,
//   ROOT_STACK_GROUP_PATH,
//   Stack,
//   StackGroup,
//   StackGroupPath,
//   StackPath,
// } from "@takomo/stacks-model"
// import {
//   coreResolverProviders,
//   ResolverRegistry,
// } from "@takomo/stacks-resolvers"
// import {
//   collectFromHierarchy,
//   createConsoleLogger,
//   TemplateEngine,
// } from "@takomo/util"
// import * as path from "path"
// import { processConfigTree } from "../../src/config/process-config-tree"
//
// const byName = (a: StackGroup, b: StackGroup) => a.name.localeCompare(b.name)
//
// const byStackName = (a: Stack, b: Stack) => a.name.localeCompare(b.name)
//
// const byStackPath = (a: Stack, b: Stack) => a.path.localeCompare(b.path)
//
// const byRegion = (a: Stack, b: Stack) => a.region.localeCompare(b.region)
//
// const logger = createConsoleLogger({
//   logLevel: "info",
//   concealConfidentialInformation: true,
// })
//
// const resolverRegistry = new ResolverRegistry(logger)
//
// coreResolverProviders().forEach((p) =>
//   resolverRegistry.registerBuiltInProvider(p),
// )
//
// const collectStacksToMap = (root: StackGroup): Map<StackPath, Stack> => {
//   const stackGroups = collectFromHierarchy(root, (n) => n.children)
//   return new Map(
//     stackGroups
//       .reduce(
//         (collected, stackGroup) => [...collected, ...stackGroup.stacks],
//         new Array<Stack>(),
//       )
//       .map((stack) => [stack.path, stack]),
//   )
// }
//
// const assertChildren = (
//   stackGroup: StackGroup,
//   ...expectedChildStackGroupPaths: StackGroupPath[]
// ): void => {
//   const childPaths = stackGroup.children
//     .slice()
//     .sort(byName)
//     .map((s) => s.path)
//   expect(childPaths).toStrictEqual(expectedChildStackGroupPaths.slice().sort())
// }
//
// const assertStacks = (
//   stackGroup: StackGroup,
//   ...expectedStackPaths: StackPath[]
// ): void => {
//   const stackPaths = stackGroup.stacks
//     .slice()
//     .sort(byStackPath)
//     .map((s) => s.path)
//   expect(stackPaths).toStrictEqual(expectedStackPaths.slice().sort())
// }
//
// const assertStackDependencies = (
//   stack: Stack | undefined,
//   ...expectedDependencies: StackPath[]
// ): void => {
//   if (!stack) {
//     fail("Expected stack to be defined")
//   }
//
//   const dependencies = stack.dependencies.slice().sort()
//   expect(dependencies).toStrictEqual(expectedDependencies.slice().sort())
// }
//
// const doProcessConfigTree = async (
//   configsDir: string,
//   commandPath: CommandPath = ROOT_STACK_GROUP_PATH,
// ): Promise<StackGroup> =>
//   buildConfigTree(
//     logger,
//     path.join(
//       process.cwd(),
//       "test",
//       "config",
//       "test-files",
//       configsDir,
//       "stacks",
//     ),
//     ROOT_STACK_GROUP_PATH,
//   ).then((configTree) =>
//     processConfigTree(
//       logger,
//       mockTakomoCredentialProvider(),
//       new Map(),
//       resolverRegistry,
//       new Map(),
//       options,
//       { var: {}, env: {}, context: { projectDir: "" } },
//       new TemplateEngine(),
//       commandPath,
//       configTree,
//     ),
//   )
//
// describe("#processConfigTree", () => {
//   describe("returns a correctly build hierarchy", () => {
//     test("when an empty stacks dir is given", async () => {
//       const root = await doProcessConfigTree("empty")
//       expect(root.path).toBe("/")
//       expect(root.children).toHaveLength(0)
//     })
//
//     test("when an empty stacks dir with only a root stack group config is given", async () => {
//       const root = await doProcessConfigTree("just-root-config")
//       expect(root.path).toBe("/")
//       expect(root.children).toHaveLength(0)
//       expect(root.regions).toStrictEqual(["us-east-1", "eu-central-1"])
//     })
//
//     test("when stacks dir with nested groups and stacks is given", async () => {
//       const root = await doProcessConfigTree("example")
//       const children = root.children.slice().sort(byName)
//       const childNames = children.map((c) => c.name)
//
//       expect(childNames).toStrictEqual(["database", "logs", "network", "s3"])
//
//       const [database, logs, network, s3] = children
//
//       expect(database.stacks).toHaveLength(1)
//       const [rds1] = database.stacks
//       expect(rds1.path).toBe("/database/rds.yml/eu-north-1")
//       expect(rds1.region).toBe("eu-north-1")
//
//       expect(logs.children).toHaveLength(2)
//       expect(logs.stacks).toHaveLength(0)
//
//       expect(network.children).toHaveLength(0)
//       expect(network.stacks).toHaveLength(3)
//
//       const [sgs, subnets, vpc] = network.stacks.slice().sort(byStackPath)
//
//       expect(sgs.template).toBe("security-groups.yml")
//       expect(subnets.template).toBe("network/subnets.json")
//       expect(vpc.template).toBe("network/vpc.yml")
//
//       expect(s3.ignore).toBeTruthy()
//       expect(s3.children).toHaveLength(0)
//       expect(s3.stacks).toHaveLength(0)
//     })
//
//     test("when a hierarchy with different regions is given", async () => {
//       const root = await doProcessConfigTree("regions")
//       expect(root.regions).toStrictEqual(["eu-west-1", "eu-central-1"])
//
//       const [aaa, bbb] = root.children.slice().sort(byName)
//       expect(aaa.regions).toStrictEqual(["eu-west-1", "eu-central-1"])
//       expect(bbb.regions).toStrictEqual(["us-east-1"])
//
//       const aaaStacks = aaa.stacks.slice().sort(byStackPath)
//       expect(aaaStacks.length).toBe(3)
//
//       const [stack3a, stack3b, stack4] = aaaStacks
//       expect(stack3a.region).toBe("eu-central-1")
//       expect(stack3b.region).toBe("eu-west-1")
//       expect(stack4.region).toBe("us-west-1")
//
//       const bbbStacks = bbb.stacks.slice().sort(byStackPath)
//       expect(bbbStacks.length).toBe(2)
//
//       const [stack1, stack2] = bbbStacks
//       expect(stack1.region).toBe("eu-north-1")
//       expect(stack2.region).toBe("us-east-1")
//     })
//
//     test("when a hierarchy with different account ids is given", async () => {
//       const root = await doProcessConfigTree("account-ids")
//       expect(root.accountIds).toStrictEqual(["999999999999"])
//
//       const [x, y] = root.children.slice().sort(byName)
//       expect(x.accountIds).toStrictEqual(["123456789012"])
//       expect(y.accountIds).toStrictEqual(["999999999999"])
//
//       const [stackA] = x.stacks.slice().sort(byRegion)
//
//       expect(stackA.accountIds).toStrictEqual(["123456789012"])
//
//       const [stackB, stackC] = y.stacks.slice().sort(byStackPath)
//
//       expect(stackB.accountIds).toStrictEqual(["888888888888"])
//       expect(stackC.accountIds).toStrictEqual(["999999999999"])
//     })
//
//     describe("when a hierarchy with dependencies between stacks is given", () => {
//       test("and default command path is used", async () => {
//         const root = await doProcessConfigTree("dependencies")
//         const [sg, vpc] = root.stacks.slice().sort(byStackName)
//
//         expect(sg.path).toBe("/sg.yml/eu-west-1")
//         expect(vpc.path).toBe("/vpc.yml/eu-west-1")
//       })
//
//       test("and '/sg.yml' command path is used", async () => {
//         const root = await doProcessConfigTree("dependencies", "/sg.yml")
//         const stacks = root.stacks.slice().sort(byStackName)
//         expect(stacks).toHaveLength(2)
//
//         const [sg, vpc] = stacks
//
//         expect(sg.path).toBe("/sg.yml/eu-west-1")
//         expect(vpc.path).toBe("/vpc.yml/eu-west-1")
//       })
//
//       test("and '/vpc.yml' command path is used", async () => {
//         const root = await doProcessConfigTree("dependencies", "/vpc.yml")
//         const stacks = root.stacks.slice().sort(byStackName)
//         expect(stacks).toHaveLength(1)
//
//         const [vpc] = stacks
//
//         expect(vpc.path).toBe("/vpc.yml/eu-west-1")
//       })
//     })
//
//     describe("when a hierarchy with resolver dependencies between stacks is given", () => {
//       test("and default command path is used", async () => {
//         const root = await doProcessConfigTree("resolver-dependencies")
//         const [sg, vpc] = root.stacks.slice().sort(byStackName)
//
//         expect(sg.path).toBe("/sg.yml/eu-west-1")
//         expect(vpc.path).toBe("/vpc.yml/eu-west-1")
//       })
//
//       test("and '/sg.yml' command path is used", async () => {
//         const root = await doProcessConfigTree(
//           "resolver-dependencies",
//           "/sg.yml",
//         )
//         const stacks = root.stacks.slice().sort(byStackName)
//         expect(stacks).toHaveLength(2)
//
//         const [sg, vpc] = stacks
//
//         expect(sg.path).toBe("/sg.yml/eu-west-1")
//         expect(vpc.path).toBe("/vpc.yml/eu-west-1")
//       })
//
//       test("and '/vpc.yml' command path is used", async () => {
//         const root = await doProcessConfigTree(
//           "resolver-dependencies",
//           "/vpc.yml",
//         )
//         const stacks = root.stacks.slice().sort(byStackName)
//         expect(stacks).toHaveLength(1)
//
//         const [vpc] = stacks
//
//         expect(vpc.path).toBe("/vpc.yml/eu-west-1")
//       })
//     })
//
//     describe("when a hierarchy with complex dependencies is given", () => {
//       test("and default command path is used", async () => {
//         const root = await doProcessConfigTree("complex-dependencies")
//
//         assertChildren(root, "/group1", "/group2")
//         assertStacks(root, "/c.yml/eu-central-1")
//
//         const [group1, group2] = root.children.slice().sort(byName)
//
//         assertChildren(group1)
//         assertStacks(
//           group1,
//           "/group1/a.yml/eu-central-1",
//           "/group1/d.yml/eu-central-1",
//           "/group1/e.yml/eu-central-1",
//           "/group1/i.yml/eu-central-1",
//           "/group1/j.yml/eu-central-1",
//           "/group1/k.yml/eu-central-1",
//           "/group1/l.yml/eu-central-1",
//         )
//
//         assertChildren(group2)
//         assertStacks(
//           group2,
//           "/group2/b.yml/eu-central-1",
//           "/group2/f.yml/eu-central-1",
//           "/group2/g.yml/eu-central-1",
//           "/group2/h.yml/eu-central-1",
//         )
//
//         const stacksByPath = collectStacksToMap(root)
//         assertStackDependencies(
//           stacksByPath.get("/c.yml/eu-central-1"),
//           "/group2/b.yml/eu-central-1",
//           "/group2/g.yml/eu-central-1",
//         )
//
//         assertStackDependencies(
//           stacksByPath.get("/group1/a.yml/eu-central-1"),
//           "/group1/d.yml/eu-central-1",
//         )
//
//         assertStackDependencies(
//           stacksByPath.get("/group1/d.yml/eu-central-1"),
//           "/group1/i.yml/eu-central-1",
//           "/group1/j.yml/eu-central-1",
//           "/group1/k.yml/eu-central-1",
//           "/group1/l.yml/eu-central-1",
//           "/group1/e.yml/eu-central-1",
//         )
//
//         assertStackDependencies(stacksByPath.get("/group1/e.yml/eu-central-1"))
//
//         assertStackDependencies(stacksByPath.get("/group1/i.yml/eu-central-1"))
//
//         assertStackDependencies(stacksByPath.get("/group1/j.yml/eu-central-1"))
//
//         assertStackDependencies(stacksByPath.get("/group1/k.yml/eu-central-1"))
//
//         assertStackDependencies(
//           stacksByPath.get("/group1/l.yml/eu-central-1"),
//           "/group1/k.yml/eu-central-1",
//         )
//
//         assertStackDependencies(
//           stacksByPath.get("/group2/b.yml/eu-central-1"),
//           "/group2/f.yml/eu-central-1",
//         )
//         assertStackDependencies(
//           stacksByPath.get("/group2/f.yml/eu-central-1"),
//           "/group2/g.yml/eu-central-1",
//           "/group2/h.yml/eu-central-1",
//           "/group1/d.yml/eu-central-1",
//         )
//         assertStackDependencies(
//           stacksByPath.get("/group2/g.yml/eu-central-1"),
//           "/group1/e.yml/eu-central-1",
//         )
//         assertStackDependencies(stacksByPath.get("/group2/h.yml/eu-central-1"))
//       })
//     })
//   })
// })
