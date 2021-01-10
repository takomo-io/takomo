import { CredentialManager } from "@takomo/aws-clients"
import { IamRoleArn } from "@takomo/aws-model"
import { CommandContext } from "@takomo/core"
import {
  CommandPath,
  createStackGroup,
  HookInitializersMap,
  InternalStack,
  ROOT_STACK_GROUP_PATH,
  StackGroup,
  StackGroupPath,
  StackPath,
} from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import { TkmLogger } from "@takomo/util"
import flatten from "lodash.flatten"
import uniq from "lodash.uniq"
import { isWithinCommandPath } from "../common"
import {
  checkCyclicDependencies,
  processStackDependencies,
} from "../dependencies"
import { buildStack } from "./build-stack"
import { ConfigTree, StackGroupConfigNode } from "./config-tree"
import { doCreateStackGroup } from "./create-stack-group"

class ProcessStatus {
  readonly #stackGroups = new Map<StackGroupPath, StackGroup>()
  readonly #stacks = new Map<StackPath, InternalStack>()
  readonly #newStacks = new Map<StackPath, InternalStack>()

  getRootStackGroup = (): StackGroup =>
    this.getStackGroup(ROOT_STACK_GROUP_PATH)

  isStackGroupProcessed = (path: StackGroupPath): boolean =>
    this.#stackGroups.has(path)

  isStackProcessed = (path: StackPath): boolean => this.#stacks.has(path)

  setStackGroupProcessed = (stackGroup: StackGroup): void => {
    this.#stackGroups.set(stackGroup.path, stackGroup)
  }

  setStackProcessed = (stack: InternalStack): void => {
    this.#stacks.set(stack.path, stack)
    this.#newStacks.set(stack.path, stack)
  }

  getStackGroup = (path: StackGroupPath): StackGroup => {
    const stackGroup = this.#stackGroups.get(path)
    if (!stackGroup) {
      throw new Error(`Stack group '${path}' is not processed`)
    }

    return stackGroup
  }

  getStack = (path: StackPath): InternalStack => {
    const stack = this.#stacks.get(path)
    if (!stack) {
      throw new Error(`Stack '${path}' is not processed`)
    }

    return stack
  }

  getNewlyProcessedStacks = (): InternalStack[] =>
    Array.from(this.#newStacks.values())
  getStackGroups = (): StackGroup[] => Array.from(this.#stackGroups.values())
  getStacks = (): InternalStack[] => Array.from(this.#stacks.values())

  reset = (): void => this.#newStacks.clear()
}

const populateChildrenAndStacks = (
  stackGroup: StackGroup,
  allStacks: InternalStack[],
  allStackGroups: StackGroup[],
): StackGroup => {
  const children = allStackGroups
    .filter((sg) => sg.parentPath === stackGroup.path)
    .map((child) => populateChildrenAndStacks(child, allStacks, allStackGroups))

  const stacks = allStacks
    .filter((s) => s.stackGroupPath === stackGroup.path)
    .filter((s) => !s.ignore)

  return createStackGroup({
    ...stackGroup.toProps(),
    stacks,
    children,
  })
}

const processStackGroupConfigNode = async (
  ctx: CommandContext,
  logger: TkmLogger,
  credentialManager: CredentialManager,
  credentialManagers: Map<IamRoleArn, CredentialManager>,
  resolverRegistry: ResolverRegistry,
  hookInitializers: HookInitializersMap,
  commandPath: CommandPath,
  status: ProcessStatus,
  node: StackGroupConfigNode,
): Promise<void> => {
  logger.debug(`Process stack group config node with path '${node.path}'`)
  if (!isWithinCommandPath(commandPath, node.path)) {
    logger.debug(
      `Stack group config node with path '${node.path}' is not within command path '${commandPath}'`,
    )
    return
  }

  if (!status.isStackGroupProcessed(node.path)) {
    logger.debug(
      `Stack group config node with path '${node.path}' is not yet processed`,
    )
    const parent = node.parentPath
      ? status.getStackGroup(node.parentPath)
      : undefined

    const stackGroup = await doCreateStackGroup(ctx, logger, node, parent)

    status.setStackGroupProcessed(stackGroup)
  } else {
    logger.debug(
      `Stack group config node with path '${node.path}' is already processed`,
    )
  }

  const currentStackGroup = status.getStackGroup(node.path)

  const stacksToProcess = currentStackGroup.ignore
    ? []
    : node.stacks
        .filter((item) => isWithinCommandPath(commandPath, item.path))
        .filter((item) => !status.isStackProcessed(item.path))

  const processedStacks = await Promise.all(
    stacksToProcess.map((stack) =>
      buildStack(
        ctx,
        logger,
        credentialManager,
        credentialManagers,
        resolverRegistry,
        hookInitializers,
        stack,
        status.getStackGroup(node.path),
        commandPath,
      ),
    ),
  )

  flatten(processedStacks).forEach(status.setStackProcessed)
  const childrenToProcess = node.children.filter((child) =>
    isWithinCommandPath(commandPath, child.path),
  )

  await Promise.all(
    childrenToProcess.map((child) =>
      processStackGroupConfigNode(
        ctx,
        logger,
        credentialManager,
        credentialManagers,
        resolverRegistry,
        hookInitializers,
        commandPath,
        status,
        child,
      ),
    ),
  )
}

export const processConfigTree = async (
  ctx: CommandContext,
  logger: TkmLogger,
  credentialManager: CredentialManager,
  credentialManagers: Map<IamRoleArn, CredentialManager>,
  resolverRegistry: ResolverRegistry,
  hookInitializers: HookInitializersMap,
  commandPath: CommandPath,
  configTree: ConfigTree,
): Promise<StackGroup> => {
  const item = configTree.rootStackGroup
  const status = new ProcessStatus()

  let commandPaths = [commandPath]
  while (commandPaths.length > 0) {
    logger.debugObject("Command paths to process:", commandPaths)
    for (const cp of commandPaths) {
      logger.debug(`Process config tree using command path: ${cp}`)
      await processStackGroupConfigNode(
        ctx,
        logger,
        credentialManager,
        credentialManagers,
        resolverRegistry,
        hookInitializers,
        cp,
        status,
        item,
      )
    }

    commandPaths = uniq(
      status
        .getNewlyProcessedStacks()
        .filter((s) => !s.ignore)
        .reduce((collected, stack) => {
          const parameterDependencies = flatten(
            Array.from(stack.parameters.values()).map((p) =>
              p.getDependencies(),
            ),
          )

          return [...collected, ...stack.dependencies, ...parameterDependencies]
        }, new Array<StackPath>()),
    )

    status.reset()
  }

  const allStacks = processStackDependencies(status.getStacks())
  const allStackGroups = status.getStackGroups()
  const root = status.getRootStackGroup()

  const stacksByPath = new Map(allStacks.map((s) => [s.path, s]))
  checkCyclicDependencies(stacksByPath)

  return populateChildrenAndStacks(root, allStacks, allStackGroups)
}
