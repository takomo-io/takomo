import {
  CommandPath,
  Constants,
  IamRoleArn,
  Options,
  StackGroupPath,
  StackPath,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import { HookInitializersMap, Stack, StackGroup } from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import { Logger, TemplateEngine } from "@takomo/util"
import flatten from "lodash.flatten"
import uniq from "lodash.uniq"
import { isWithinCommandPath } from "../common"
import {
  checkCyclicDependencies,
  processStackDependencies,
} from "../dependencies"
import { buildStack } from "./build-stack"
import { createStackGroup } from "./create-stack-group"
import { ConfigTree } from "./tree/config-tree"
import { StackGroupConfigNode } from "./tree/stack-group-config-node"

class ProcessStatus {
  readonly #stackGroups = new Map<StackGroupPath, StackGroup>()
  readonly #stacks = new Map<StackPath, Stack>()
  readonly #newStacks = new Map<StackPath, Stack>()

  getRootStackGroup = (): StackGroup =>
    this.getStackGroup(Constants.ROOT_STACK_GROUP_PATH)

  isStackGroupProcessed = (path: StackGroupPath): boolean =>
    this.#stackGroups.has(path)

  isStackProcessed = (path: StackPath): boolean => this.#stacks.has(path)

  setStackGroupProcessed = (stackGroup: StackGroup): void => {
    this.#stackGroups.set(stackGroup.getPath(), stackGroup)
  }

  setStackProcessed = (stack: Stack): void => {
    this.#stacks.set(stack.getPath(), stack)
    this.#newStacks.set(stack.getPath(), stack)
  }

  getStackGroup = (path: StackGroupPath): StackGroup => {
    const stackGroup = this.#stackGroups.get(path)
    if (!stackGroup) {
      throw new Error(`Stack group '${path}' is not processed`)
    }

    return stackGroup
  }

  getStack = (path: StackPath): Stack => {
    const stack = this.#stacks.get(path)
    if (!stack) {
      throw new Error(`Stack '${path}' is not processed`)
    }

    return stack
  }

  getNewlyProcessedStacks = (): Stack[] => Array.from(this.#newStacks.values())
  getStackGroups = (): StackGroup[] => Array.from(this.#stackGroups.values())
  getStacks = (): Stack[] => Array.from(this.#stacks.values())

  reset = (): void => this.#newStacks.clear()
}

const populateChildrenAndStacks = (
  stackGroup: StackGroup,
  allStacks: Stack[],
  allStackGroups: StackGroup[],
): StackGroup => {
  const children = allStackGroups
    .filter((sg) => sg.getParentPath() === stackGroup.getPath())
    .map((child) => populateChildrenAndStacks(child, allStacks, allStackGroups))

  const stacks = allStacks
    .filter((s) => s.getStackGroupPath() === stackGroup.getPath())
    .filter((s) => !s.isIgnored())

  return new StackGroup({
    ...stackGroup.toProps(),
    stacks,
    children,
  })
}

const processStackGroupConfigNode = async (
  logger: Logger,
  credentialProvider: TakomoCredentialProvider,
  credentialsProviders: Map<IamRoleArn, TakomoCredentialProvider>,
  resolverRegistry: ResolverRegistry,
  hookInitializers: HookInitializersMap,
  options: Options,
  variables: Variables,
  templateEngine: TemplateEngine,
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
      : null

    const stackGroup = await createStackGroup(
      logger,
      options,
      variables,
      node,
      parent,
      templateEngine,
    )

    status.setStackGroupProcessed(stackGroup)
  } else {
    logger.debug(
      `Stack group config node with path '${node.path}' is already processed`,
    )
  }

  const currentStackGroup = status.getStackGroup(node.path)

  const stacksToProcess = currentStackGroup.isIgnored()
    ? []
    : node.stacks
        .filter((item) => isWithinCommandPath(commandPath, item.path))
        .filter((item) => !status.isStackProcessed(item.path))

  const processedStacks = await Promise.all(
    stacksToProcess.map((stack) =>
      buildStack(
        logger,
        credentialProvider,
        credentialsProviders,
        resolverRegistry,
        hookInitializers,
        options,
        variables,
        stack,
        status.getStackGroup(node.path),
        templateEngine,
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
        logger,
        credentialProvider,
        credentialsProviders,
        resolverRegistry,
        hookInitializers,
        options,
        variables,
        templateEngine,
        commandPath,
        status,
        child,
      ),
    ),
  )
}

export const processConfigTree = async (
  logger: Logger,
  credentialProvider: TakomoCredentialProvider,
  credentialsProviders: Map<IamRoleArn, TakomoCredentialProvider>,
  resolverRegistry: ResolverRegistry,
  hookInitializers: HookInitializersMap,
  options: Options,
  variables: Variables,
  templateEngine: TemplateEngine,
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
        logger,
        credentialProvider,
        credentialsProviders,
        resolverRegistry,
        hookInitializers,
        options,
        variables,
        templateEngine,
        cp,
        status,
        item,
      )
    }

    commandPaths = uniq(
      status
        .getNewlyProcessedStacks()
        .filter((s) => !s.isIgnored())
        .reduce((collected, stack) => {
          const parameterDependencies = flatten(
            Array.from(stack.getParameters().values()).map((p) =>
              p.getDependencies(),
            ),
          )

          return [
            ...collected,
            ...stack.getDependencies(),
            ...parameterDependencies,
          ]
        }, new Array<StackPath>()),
    )

    status.reset()
  }

  const allStacks = processStackDependencies(status.getStacks())
  const allStackGroups = status.getStackGroups()
  const root = status.getRootStackGroup()

  const stacksByPath = new Map(allStacks.map((s) => [s.getPath(), s]))
  checkCyclicDependencies(stacksByPath)

  return populateChildrenAndStacks(root, allStacks, allStackGroups)
}
