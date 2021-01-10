import {
  CredentialManager,
  initDefaultCredentialManager,
} from "@takomo/aws-clients"
import { IamRoleArn } from "@takomo/aws-model"
import { CommandContext } from "@takomo/core"
import {
  CommandPath,
  InternalStacksContext,
  ROOT_STACK_GROUP_PATH,
  StackGroupPath,
  StackPath,
} from "@takomo/stacks-model"
import {
  coreResolverProviders,
  ResolverRegistry,
} from "@takomo/stacks-resolvers"
import { collectFromHierarchy, deepFreeze, TkmLogger } from "@takomo/util"
import flatten from "lodash.flatten"
import {
  isStackGroupPath,
  validateStackCredentialManagersWithAllowedAccountIds,
} from "../common"
import {
  CommandPathMatchesNoStacksError,
  StacksConfigRepository,
} from "../model"
import { collectStackGroups } from "./collect-stack-groups"
import { collectStacks } from "./collect-stacks"
import { ConfigTree } from "./config-tree"
import { coreHookInitializers } from "./hooks"
import { processConfigTree } from "./process-config-tree"

export interface BuildConfigContextInput {
  readonly configRepository: StacksConfigRepository
  readonly ctx: CommandContext
  readonly logger: TkmLogger
  readonly overrideCredentialManager?: CredentialManager
  readonly commandPath?: CommandPath
  readonly ignoreDependencies?: boolean
}

export const validateCommandPath = (
  configTree: ConfigTree,
  commandPath?: CommandPath,
): void => {
  if (!commandPath || commandPath === ROOT_STACK_GROUP_PATH) {
    return
  }

  const stackGroups = collectFromHierarchy(
    configTree.rootStackGroup,
    (node) => node.children,
  )

  const stackGroupPaths = stackGroups.map((s) => s.path)
  const stackPaths = flatten(stackGroups.map((s) => s.stacks)).map(
    (s) => s.path,
  )

  if (isStackGroupPath(commandPath)) {
    if (!stackGroupPaths.some((s) => s === commandPath)) {
      throw new CommandPathMatchesNoStacksError(commandPath, stackPaths)
    }
  } else if (!stackGroupPaths.some((s) => s === commandPath)) {
    if (!stackPaths.some((s) => commandPath.startsWith(s))) {
      throw new CommandPathMatchesNoStacksError(commandPath, stackPaths)
    }
  }
}

export const buildStacksContext = async ({
  ctx,
  logger,
  overrideCredentialManager,
  commandPath,
  configRepository,
}: BuildConfigContextInput): Promise<InternalStacksContext> => {
  logger.info("Load configuration")

  const configTree = await configRepository.buildConfigTree()

  validateCommandPath(configTree, commandPath)

  const hookInitializers = coreHookInitializers()

  const resolverRegistry = new ResolverRegistry(logger)
  coreResolverProviders().forEach((p) =>
    resolverRegistry.registerBuiltInProvider(p),
  )

  await configRepository.loadExtensions(resolverRegistry, hookInitializers)

  const credentialManagers = new Map<IamRoleArn, CredentialManager>()

  const credentialManager =
    overrideCredentialManager ||
    (await initDefaultCredentialManager(ctx.credentials))

  const templateEngine = configRepository.templateEngine

  const rootStackGroup = await processConfigTree(
    ctx,
    logger,
    credentialManager,
    credentialManagers,
    resolverRegistry,
    hookInitializers,
    commandPath ?? ROOT_STACK_GROUP_PATH,
    configTree,
  )

  const stackGroups = collectStackGroups(rootStackGroup)
  const stacks = collectStacks(stackGroups)
  const stacksByPath = new Map(stacks.map((s) => [s.path, s]))

  await Promise.all(
    Array.from(credentialManagers.values()).map((cm) => cm.getCallerIdentity()),
  )

  await validateStackCredentialManagersWithAllowedAccountIds(stacks)

  return deepFreeze({
    ...ctx,
    credentialManager,
    templateEngine,
    rootStackGroup,
    stacks,
    getStackGroup: (stackGroupPath: StackGroupPath) =>
      stackGroups.get(stackGroupPath),
    getStackByExactPath: (path: StackPath) => {
      const stack = stacksByPath.get(path)
      if (!stack) {
        throw new Error(`No stack found with path: ${path}`)
      }

      return stack
    },
    getStacksByPath: (path: StackPath) =>
      stacks.filter((s) => s.path.startsWith(path)),
  })
}
