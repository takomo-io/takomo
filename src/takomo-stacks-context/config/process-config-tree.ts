import R from "ramda"
import { InternalCredentialManager } from "../../takomo-aws-clients"
import { IamRoleArn } from "../../takomo-aws-model"
import { InternalCommandContext } from "../../takomo-core"
import { HookRegistry } from "../../takomo-stacks-hooks"
import {
  CommandPath,
  createStackGroup,
  InternalStack,
  isWithinCommandPath,
  normalizeStackPath,
  ROOT_STACK_GROUP_PATH,
  SchemaRegistry,
  StackGroup,
  StackGroupPath,
  StackPath,
} from "../../takomo-stacks-model"
import { ResolverRegistry } from "../../takomo-stacks-resolvers"
import { arrayToMap, TkmLogger } from "../../takomo-util"
import {
  checkCyclicDependencies,
  checkObsoleteDependencies,
  processStackDependencies,
} from "../dependencies"
import { StacksConfigRepository } from "../model"
import { buildStack } from "./build-stack"
import { ConfigTree, StackGroupConfigNode } from "./config-tree"
import { doCreateStackGroup } from "./create-stack-group"

export class ProcessStatus {
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

  getNewlyProcessedStacks = (): InternalStack[] =>
    Array.from(this.#newStacks.values())
  getStackGroups = (): StackGroup[] => Array.from(this.#stackGroups.values())
  getStacks = (): InternalStack[] => Array.from(this.#stacks.values())

  reset = (): void => this.#newStacks.clear()
}

const populateChildrenAndStacks = (
  stackGroup: StackGroup,
  allStacks: ReadonlyArray<InternalStack>,
  allStackGroups: ReadonlyArray<StackGroup>,
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
  ctx: InternalCommandContext,
  logger: TkmLogger,
  credentialManager: InternalCredentialManager,
  credentialManagers: Map<IamRoleArn, InternalCredentialManager>,
  resolverRegistry: ResolverRegistry,
  schemaRegistry: SchemaRegistry,
  hookRegistry: HookRegistry,
  commandPath: CommandPath,
  status: ProcessStatus,
  node: StackGroupConfigNode,
  configRepository: StacksConfigRepository,
): Promise<void> => {
  logger.trace(`Process stack group config node with path '${node.path}'`)
  if (!isWithinCommandPath(commandPath, node.path)) {
    logger.trace(
      `Stack group config node with path '${node.path}' is not within command path '${commandPath}'`,
    )
    return
  }

  if (!status.isStackGroupProcessed(node.path)) {
    logger.trace(
      `Stack group config node with path '${node.path}' is not yet processed`,
    )
    const parent = node.parentPath
      ? status.getStackGroup(node.parentPath)
      : undefined

    const stackGroup = await doCreateStackGroup(
      ctx,
      logger,
      node,
      schemaRegistry,
      parent,
    )

    status.setStackGroupProcessed(stackGroup)
  } else {
    logger.trace(
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
        schemaRegistry,
        hookRegistry,
        stack,
        status.getStackGroup(node.path),
        commandPath,
        status,
        configRepository,
      ),
    ),
  )

  processedStacks.flat().forEach(status.setStackProcessed)
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
        schemaRegistry,
        hookRegistry,
        commandPath,
        status,
        child,
        configRepository,
      ),
    ),
  )
}

export const processConfigTree = async (
  ctx: InternalCommandContext,
  logger: TkmLogger,
  credentialManager: InternalCredentialManager,
  credentialManagers: Map<IamRoleArn, InternalCredentialManager>,
  resolverRegistry: ResolverRegistry,
  schemaRegistry: SchemaRegistry,
  hookRegistry: HookRegistry,
  commandPath: CommandPath,
  configTree: ConfigTree,
  configRepository: StacksConfigRepository,
): Promise<StackGroup> => {
  const item = configTree.rootStackGroup
  const status = new ProcessStatus()

  let commandPaths = [commandPath]
  while (commandPaths.length > 0) {
    logger.traceObject("Command paths to process:", () => commandPaths)
    for (const cp of commandPaths) {
      logger.trace(`Process config tree using command path: ${cp}`)
      await processStackGroupConfigNode(
        ctx,
        logger,
        credentialManager,
        credentialManagers,
        resolverRegistry,
        schemaRegistry,
        hookRegistry,
        cp,
        status,
        item,
        configRepository,
      )
    }

    commandPaths = R.uniq(
      status
        .getNewlyProcessedStacks()
        .filter((s) => !s.ignore)
        .reduce((collected, stack) => {
          const parameterDependencies = Array.from(stack.parameters.values())
            .map((p) =>
              p
                .getDependencies()
                .map((d) => normalizeStackPath(stack.stackGroupPath, d)),
            )
            .flat()

          return [...collected, ...stack.dependencies, ...parameterDependencies]
        }, new Array<StackPath>()),
    )

    status.reset()
  }

  const allStacks = processStackDependencies(status.getStacks())
  const allStackGroups = status.getStackGroups()
  const root = status.getRootStackGroup()
  const stacksByPath = arrayToMap(allStacks, (s) => s.path)

  checkCyclicDependencies(stacksByPath)
  checkObsoleteDependencies(stacksByPath)

  return populateChildrenAndStacks(root, allStacks, allStackGroups)
}
