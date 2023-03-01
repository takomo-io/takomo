import { InternalCredentialManager } from "../../aws/common/credentials.js"
import { IamRoleArn } from "../../aws/common/model.js"
import { CommandPath } from "../../command/command-model.js"
import { InternalCommandContext } from "../../context/command-context.js"
import { InternalStacksContext } from "../../context/stacks-context.js"
import { createHookRegistry } from "../../hooks/hook-registry.js"
import {
  coreResolverProviders,
  ResolverRegistry,
} from "../../resolvers/resolver-registry.js"
import { StackGroupPath } from "../../stacks/stack-group.js"
import { normalizeStackPath, StackPath } from "../../stacks/stack.js"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants.js"
import { createSchemaRegistry } from "../../takomo-stacks-model/schemas.js"
import { arrayToMap, collectFromHierarchy } from "../../utils/collections.js"
import { TkmLogger } from "../../utils/logging.js"
import { isStackGroupPath } from "../common.js"
import {
  CommandPathMatchesNoStacksError,
  StacksConfigRepository,
} from "../model.js"
import { collectStackGroups } from "./collect-stack-groups.js"
import { collectStacks } from "./collect-stacks.js"
import { ConfigTree } from "./config-tree.js"
import { coreHookProviders } from "./hooks.js"
import { processConfigTree } from "./process-config-tree.js"

export interface BuildConfigContextInput {
  readonly configRepository: StacksConfigRepository
  readonly ctx: InternalCommandContext
  readonly logger: TkmLogger
  readonly credentialManager: InternalCredentialManager
  readonly commandPath?: CommandPath
  readonly ignoreDependencies?: boolean
  readonly validateCommandRoles?: boolean
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
  const stackPaths = stackGroups
    .map((s) => s.stacks)
    .flat()
    .map((s) => s.path)

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
  credentialManager,
  commandPath,
  configRepository,
  validateCommandRoles = true,
}: BuildConfigContextInput): Promise<InternalStacksContext> => {
  logger.info("Load configuration")

  const configTree = await configRepository.buildConfigTree()

  validateCommandPath(configTree, commandPath)

  const hookRegistry = createHookRegistry({ logger })
  for (const p of coreHookProviders()) {
    await hookRegistry.registerBuiltInProvider(p)
  }

  const resolverRegistry = new ResolverRegistry(logger)
  coreResolverProviders().forEach((p) =>
    resolverRegistry.registerBuiltInProvider(p),
  )

  for (const config of ctx.projectConfig.resolvers) {
    await resolverRegistry.registerProviderFromNpmPackage(config)
  }

  const schemaRegistry = createSchemaRegistry(logger)

  await configRepository.loadExtensions(
    resolverRegistry,
    hookRegistry,
    schemaRegistry,
  )

  const credentialManagers = new Map<IamRoleArn, InternalCredentialManager>()
  const templateEngine = configRepository.templateEngine

  const rootStackGroup = await processConfigTree(
    ctx,
    logger,
    credentialManager,
    credentialManagers,
    resolverRegistry,
    schemaRegistry,
    hookRegistry,
    commandPath ?? ROOT_STACK_GROUP_PATH,
    configTree,
    configRepository,
  )

  const stackGroups = collectStackGroups(rootStackGroup)
  const stacks = collectStacks(stackGroups)
  const stacksByPath = arrayToMap(stacks, (s) => s.path)

  if (validateCommandRoles) {
    await Promise.all(
      Array.from(credentialManagers.values()).map((cm) =>
        cm.getCallerIdentity(),
      ),
    )
  }

  return {
    ...ctx,
    credentialManager,
    templateEngine,
    rootStackGroup,
    stacks,
    concurrentStacks: 20,
    getStackGroup: (stackGroupPath: StackGroupPath) =>
      stackGroups.get(stackGroupPath),
    getStackByExactPath: (path: StackPath, stackGroupPath?: StackGroupPath) => {
      const normalizedPath = stackGroupPath
        ? normalizeStackPath(stackGroupPath, path)
        : path

      const stack = stacksByPath.get(normalizedPath)
      if (!stack) {
        throw new Error(`No stack found with path: ${path}`)
      }

      return stack
    },
    getStacksByPath: (path: StackPath, stackGroupPath?: StackGroupPath) => {
      const normalizedPath = stackGroupPath
        ? normalizeStackPath(stackGroupPath, path)
        : path
      return stacks.filter((s) => s.path.startsWith(normalizedPath))
    },
  }
}
